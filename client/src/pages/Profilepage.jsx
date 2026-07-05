import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useAuth } from '../context/AuthContext'

const Profilepage = () => {
  const navigate = useNavigate()
  const { authUser, updateProfile } = useAuth()

  const [profileData, setProfileData] = useState({
    fullname: authUser?.fullname || '',
    bio: authUser?.bio || '',
  })
  const [selectedImg, setSelectedImg] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) setSelectedImg(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    if (!selectedImg) {
      const success = await updateProfile(profileData)
      setIsSaving(false)
      if (success) navigate('/')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(selectedImg)
    reader.onload = async () => {
      const success = await updateProfile({ ...profileData, profilePic: reader.result })
      setIsSaving(false)
      if (success) navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white relative">

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm transition-all shadow-md group"
      >
        <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Cancel & Exit
      </button>

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">My Profile Settings</h2>
          <p className="text-sm text-slate-400 mt-1">Update your account identity details and bio presence</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <img
                src={selectedImg ? URL.createObjectURL(selectedImg) : authUser?.profilePic || assets.avatar_icon}
                alt="Profile Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-md select-none"
                draggable="false"
              />
              <label
                htmlFor="avatar-input"
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
              >
                <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <span className="text-[11px] text-white font-medium">Upload Photo</span>
              </label>
            </div>
            <input type="file" id="avatar-input" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <hr className="border-slate-800" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="fullname"
                required
                value={profileData.fullname}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                disabled
                value={authUser?.email || ''}
                className="w-full p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 text-slate-500 cursor-not-allowed text-sm"
              />
            </div>

            <div className="flex flex-col md:col-span-2 gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About / Bio</label>
              <textarea
                name="bio"
                rows="3"
                value={profileData.bio}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none transition-all"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition-colors mt-4 shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>

        </form>

      </div>
    </div>
  )
}

export default Profilepage