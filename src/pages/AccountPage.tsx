import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, User, LogOut } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

const AccountPage: React.FC = () => {
  const { user, isAdminOverride, signOut } = useAuth()
  const [language, setLanguage] = useState<string>(() => (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'UZ')

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('lang', language) }, [language])

  return (
    <div className="max-w-laptop mx-auto px-section-x pb-16">
      <div className="py-3 md:py-6">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100">Account</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-800 dark:text-gray-200">Language</span>
            </div>
            <select
              aria-label="Language selector"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="UZ">Uzbek</option>
              <option value="RU">Russian</option>
              <option value="EN">English</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-800 dark:text-gray-200">Appearance</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          {user || isAdminOverride ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200">
                <User className="h-4 w-4" />
                <span>Signed in</span>
              </div>
              <button onClick={signOut} className="flex items-center space-x-1 text-sm text-red-600"><LogOut className="h-4 w-4" /><span>Sign Out</span></button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link to="/signin" className="text-center text-sm py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">Sign In</Link>
              <Link to="/signup" className="text-center text-sm py-2 rounded-full bg-black text-white dark:bg-white dark:text-black">Sign Up</Link>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400">
            +998 71 123 45 67 · +998 90 123 45 67
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage


