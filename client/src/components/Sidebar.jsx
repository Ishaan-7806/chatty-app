import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { users, selectedUser, setSelectedUser, getUsersForSidebar, unseenMessages, setUnseenMessages } = useChat()
  const { logout, onlineUsers } = useAuth()

  useEffect(() => {
    getUsersForSidebar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineUsers])

  const filteredUsers = search
    ? users.filter((u) => u.fullname.toLowerCase().includes(search.toLowerCase()))
    : users

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }))
  }

  const handleProfileClick = () => {
    setShowMenu(false)
    navigate('/profile')
  }

  const handleLogout = () => {
    setShowMenu(false)
    logout()
    navigate('/login')
  }

  const isAiSelected = selectedUser?._id === "ai-bot"

  const handleAiClick = () => {
    setSelectedUser({ _id: "ai-bot", fullname: "AI Assistant", isAI: true })
  }

  return (
    <div className="flex flex-col items-stretch h-full bg-slate-900 border-r border-slate-800 m-4 rounded-xl p-4 shadow-lg min-w-[250px] relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src="/logog.svg" alt="QuickChat Logo" className="w-10 h-10 rounded-full select-none" draggable="false" />
          <span className="ml-2 text-xl font-semibold text-white">QuickChat</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 focus:outline-none"
            aria-label="Options"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="5" cy="12" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="19" cy="12" r="1.5"/>
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-slate-800 text-white rounded shadow-md py-2 z-10" onMouseLeave={() => setShowMenu(false)}>
              <button onClick={handleProfileClick} className="w-full text-left px-4 py-2 hover:bg-slate-700">Edit Profile</button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-slate-700">Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          placeholder="Search users..."
        />
      </div>

      {/* --- AI ASSISTANT PINNED ENTRY --- */}
      <div
        onClick={handleAiClick}
        className={`flex items-center px-3 py-2 mb-3 rounded cursor-pointer transition-colors border ${
          isAiSelected ? 'bg-blue-900 border-blue-700' : 'hover:bg-slate-800 bg-slate-900 border-slate-800'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          AI
        </div>
        <div className="flex-1 ml-3">
          <div className="font-semibold text-white leading-tight">AI Assistant</div>
          <div className="text-xs text-slate-400">Always available</div>
        </div>
      </div>
      <hr className="border-slate-800 mb-3" />

      <div className="flex-1 overflow-y-auto">
        {filteredUsers && filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id)
            const isActive = selectedUser?._id === user._id
            const unread = unseenMessages[user._id]

            return (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`flex items-center px-3 py-2 mb-2 rounded cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-900' : 'hover:bg-slate-800 bg-slate-900'
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt={user.fullname}
                    className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover"
                    draggable="false"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={isOnline ? 'Online' : 'Offline'}
                  ></span>
                </div>

                <div className="flex-1 ml-3">
                  <div className="font-semibold text-white leading-tight">{user.fullname}</div>
                  <div className="text-xs text-slate-400">{isOnline ? 'Online' : 'Offline'}</div>
                </div>

                {unread > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-slate-400 text-sm text-center mt-6">No users found.</div>
        )}
      </div>
    </div>
  )
}

export default Sidebar