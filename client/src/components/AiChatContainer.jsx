import React, { useEffect, useRef, useState } from 'react'
import { useAiChat } from '../context/AIChatContext'

const AiChatContainer = () => {
  const messageEndRef = useRef(null)
  const [text, setText] = useState('')
  const { aiMessages, isAiTyping, isHistoryLoaded, getAiHistory, sendMessageToAi } = useAiChat()

  useEffect(() => {
    if (!isHistoryLoaded) getAiHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, isAiTyping])

  const formatTime = (isoString) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const message = text.trim()
    setText('')
    await sendMessageToAi(message)
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 my-4 mr-4 rounded-xl border border-slate-800 overflow-hidden shadow-lg">

      <div className="flex items-center gap-3 px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div>
          <h2 className="text-white font-semibold leading-tight">AI Assistant</h2>
          <p className="text-xs text-slate-400">Remembers your past conversations</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {aiMessages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-10">
            Ask me anything — I'll remember what we talk about.
          </div>
        )}

        {aiMessages.map((msg, index) => {
          const isMe = msg.role === "user"
          return (
            <div key={index} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  AI
                </div>
              )}
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}

        {isAiTyping && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AI
            </div>
            <div className="px-4 py-2.5 rounded-2xl text-sm bg-slate-800 text-slate-400 rounded-bl-none">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message the AI Assistant..."
          className="flex-1 p-2.5 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        />
        <button
          type="submit"
          disabled={isAiTyping}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>

    </div>
  )
}

export default AiChatContainer