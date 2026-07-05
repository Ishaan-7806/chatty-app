import React, { useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

const Chatcontainer = () => {
  const messageEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const [text, setText] = useState('')
  const [aiNotes, setAiNotes] = useState([]) // local-only AI summary bubbles, not persisted
  const [isAiThinking, setIsAiThinking] = useState(false)

  const { messages, selectedUser, getMessages, sendMessage } = useChat()
  const { authUser } = useAuth()

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
      setAiNotes([]) // clear AI notes when switching conversations
    }
  }, [selectedUser])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiNotes, isAiThinking])

  const formatTime = (isoString) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleAiSummarize = async () => {
    if (messages.length === 0) {
      toast.error("No messages in this conversation yet")
      return
    }

    setIsAiThinking(true)
    try {
      const { data } = await axiosInstance.post("/api/ai/summarize-chat", { messages })
      setAiNotes((prev) => [...prev, { text: data.summary, createdAt: new Date().toISOString() }])
    } catch (error) {
      toast.error(error.response?.data?.message || "AI summary failed")
    } finally {
      setIsAiThinking(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    // intercept @ai commands — don't send to the other user at all
    if (trimmed.toLowerCase().startsWith("@ai")) {
      setText('')
      await handleAiSummarize()
      return
    }

    await sendMessage({ text: trimmed })
    setText('')
  }

  const handleSendImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // merge real messages and local AI notes into one timeline, sorted by time
  const timeline = [
    ...messages.map((m) => ({ type: "message", data: m, time: m.createdAt })),
    ...aiNotes.map((n) => ({ type: "ai-note", data: n, time: n.createdAt })),
  ].sort((a, b) => new Date(a.time) - new Date(b.time))

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.074-.83l1.242-4.21A8.904 8.904 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        <p className="text-lg font-medium">Select a conversation to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 my-4 mr-4 rounded-xl border border-slate-800 overflow-hidden shadow-lg">

      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt={selectedUser.fullname}
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
          </div>
          <div>
            <h2 className="text-white font-semibold leading-tight">{selectedUser.fullname}</h2>
          </div>
        </div>
        <button
          onClick={handleAiSummarize}
          disabled={isAiThinking}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {isAiThinking ? "Summarizing..." : "✨ Summarize with AI"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {timeline.map((item, index) => {
          if (item.type === "ai-note") {
            return (
              <div key={`ai-${index}`} className="flex justify-center">
                <div className="max-w-[85%] bg-blue-950/40 border border-blue-800/50 rounded-xl px-4 py-3 text-sm text-blue-200">
                  <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-1">AI Summary</div>
                  {item.data.text}
                </div>
              </div>
            )
          }

          const msg = item.data
          const isMe = msg.senderId === authUser._id

          return (
            <div key={msg._id} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <img
                  src={selectedUser.profilePic || assets.avatar_icon}
                  alt={selectedUser.fullname}
                  className="w-8 h-8 rounded-full object-cover select-none"
                  draggable="false"
                />
              )}

              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {msg.image ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-1 shadow-sm">
                    <img src={msg.image} alt="Shared attachment" className="max-w-xs max-h-48 object-cover rounded-xl" />
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 mt-1 px-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}

        {isAiThinking && (
          <div className="flex justify-center">
            <div className="text-xs text-blue-400 animate-pulse">AI is summarizing the conversation...</div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleSendImage}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          aria-label="Attach image"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 12V4.5A2.25 2.25 0 015.25 2.25h13.5A2.25 2.25 0 0121 4.5v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V12z" />
          </svg>
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message, or @ai to summarize..."
          className="flex-1 p-2.5 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Send
        </button>
      </form>

    </div>
  )
}

export default Chatcontainer