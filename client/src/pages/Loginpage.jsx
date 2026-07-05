import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Loginpage = () => {
  const navigate = useNavigate()
  const { login, signup } = useAuth()

  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    bio: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const success = isSignUpMode
      ? await signup(formData)
      : await login({ email: formData.email, password: formData.password })

    setIsSubmitting(false)
    if (success) navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans text-white">

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm transition-all shadow-md group"
      >
        <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {isSignUpMode ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-slate-400">
            {isSignUpMode ? 'Get started with your QuickChat profile' : 'Enter your details to sign into QuickChat'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {isSignUpMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="fullname"
                required
                value={formData.fullname}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-all"
            />
          </div>

          {isSignUpMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Short Bio</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell others a bit about yourself..."
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition-colors mt-6 shadow-md shadow-blue-900/20"
          >
            {isSubmitting ? 'Please wait...' : isSignUpMode ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-800/60">
          <p className="text-xs text-slate-400">
            {isSignUpMode ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUpMode((prev) => !prev)}
              className="text-blue-500 hover:underline font-medium focus:outline-none"
            >
              {isSignUpMode ? 'Login Here' : 'Create an Account'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Loginpage