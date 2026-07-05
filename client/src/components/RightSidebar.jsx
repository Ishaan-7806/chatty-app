import React from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

const RightSidebar = ({ onClose }) => {
  const navigate = useNavigate()
  const { selectedUser, messages } = useChat()
  const { logout, onlineUsers } = useAuth()

  // Extract shared images from real message history instead of dummy data
  const sharedMedia = messages.filter((msg) => msg.image).map((msg) => msg.image)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!selectedUser) return null

  const isOnline = onlineUsers.includes(selectedUser._id)

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 m-4 ml-0 rounded-xl p-4 shadow-lg min-w-[300px] relative overflow-hidden">

      {/* --- CLOSE BUTTON (For Mobile/Toggles) --- */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        aria-label="Close sidebar"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* --- MAIN SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-20 scrollbar-thin">

        {/* --- USER PROFILE CARD --- */}
        <div className="flex flex-col items-center text-center pt-6">
          <div className="relative mb-3">
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt={selectedUser.fullname}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-md select-none"
              draggable="false"
            />
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-4 border-slate-900 ${
                isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
          </div>
          <h2 className="text-white text-lg font-semibold px-2">{selectedUser.fullname}</h2>
          <p className={`text-xs mt-0.5 font-medium ${isOnline ? 'text-green-400' : 'text-slate-400'}`}>
            {isOnline ? 'Active Now' : 'Offline'}
          </p>
        </div>

        <hr className="border-slate-800" />

        {/* --- BIO SECTION --- */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About / Bio</h3>
          <p className="text-sm text-slate-200 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50 leading-relaxed">
            {selectedUser.bio || "No bio available."}
          </p>
        </div>

        <hr className="border-slate-800" />

        {/* --- PAST MEDIA GALLERY --- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shared Media</h3>
            <span className="text-xs text-slate-500 font-medium">{sharedMedia.length} items</span>
          </div>

          {sharedMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((mediaImg, index) => (
                <a
                  key={index}
                  href={mediaImg}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer block"
                >
                  <img
                    src={mediaImg}
                    alt={`Shared asset ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-950/20 rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
              No photo attachments shared yet.
            </div>
          )}
        </div>

      </div>

      {/* --- ACTION LOGOUT BUTTON CONTAINER --- */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-6 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-red-400 hover:text-red-300 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group"
        >
          <svg
            className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Logout Session
        </button>
      </div>

    </div>
  )
}

export default RightSidebar