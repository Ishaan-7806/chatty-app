import Memory from "../models/memory.model.js";
import { embeddingModel, chatModel } from "../lib/gemini.js";

// helper: generate a vector embedding for a piece of text
const generateEmbedding = async (text) => {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768, // must match the Atlas vector index dimension count
  });
  return result.embedding.values; // array of 768 numbers
};

export const sendMessageToAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. embed the user's new message
    const userEmbedding = await generateEmbedding(message);

    // 2. save the user's message + embedding as a memory
    await Memory.create({
      userId,
      role: "user",
      text: message,
      embedding: userEmbedding,
    });

    // 3. vector search: find the most relevant past memories for this user
    const relevantMemories = await Memory.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: userEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: { userId: userId },
        },
      },
      {
        $project: {
          text: 1,
          role: 1,
          createdAt: 1,
          _id: 0,
        },
      },
    ]);

    // 4. build context string from retrieved memories
    const contextText = relevantMemories
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    const prompt = `You are a helpful assistant with memory of past conversations with this user.

Relevant past context:
${contextText || "No prior context available."}

Current user message: ${message}

Respond helpfully, using the past context only if it's relevant.`;

    // 5. generate the AI's reply
    const result = await chatModel.generateContent(prompt);
    const aiReply = result.response.text();

    // 6. embed and save the AI's reply as a memory too, so future turns can reference it
    const aiEmbedding = await generateEmbedding(aiReply);
    await Memory.create({
      userId,
      role: "assistant",
      text: aiReply,
      embedding: aiEmbedding,
    });

    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.log("Error in sendMessageToAI: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAIChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await Memory.find({ userId })
      .sort({ createdAt: 1 })
      .select("role text createdAt");

    res.status(200).json(history);
  } catch (error) {
    console.log("Error in getAIChatHistory: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "No messages to summarize" });
    }

    // build a plain-text transcript from the last 30 messages
    const transcript = messages
      .slice(-30)
      .map((m) => `${m.senderId === req.user._id.toString() ? "Me" : "Them"}: ${m.text || "[image]"}`)
      .join("\n");

    const prompt = `Summarize the following chat conversation in 2-4 concise sentences. Focus on key points, decisions, or important information exchanged.

Conversation:
${transcript}

Summary:`;

    const result = await chatModel.generateContent(prompt);
    const summary = result.response.text();

    res.status(200).json({ summary });
  } catch (error) {
    console.log("Error in summarizeChat: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};