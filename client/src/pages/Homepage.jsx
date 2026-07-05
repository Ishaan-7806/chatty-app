import React from 'react'
import Sidebar from '../components/Sidebar'
import Chatcontainer from '../components/Chatcontainer'
import AiChatContainer from '../components/AiChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useChat } from '../context/ChatContext'

const Homepage = () => {
  const { selectedUser, setSelectedUser } = useChat()
  const userSelected = selectedUser !== null
  const isAiChat = selectedUser?._id === "ai-bot"

  return (
    <div
      className={
        userSelected && !isAiChat
          ? 'grid grid-cols-[250px_1fr_300px] w-full h-screen bg-slate-950 overflow-hidden'
          : 'grid grid-cols-[250px_1fr] w-full h-screen bg-slate-950 overflow-hidden'
      }
    >
      <Sidebar />

      {isAiChat ? <AiChatContainer /> : <Chatcontainer />}

      {userSelected && !isAiChat && (
        <RightSidebar onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}

export default Homepage