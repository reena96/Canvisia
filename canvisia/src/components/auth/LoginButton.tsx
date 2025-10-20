import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { getAuthErrorMessage } from '@/services/auth'

export function LoginButton() {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      await signIn()
    } catch (err: any) {
      const message = getAuthErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem 1.5rem',
          fontSize: '0.95rem',
          background: 'rgba(255, 255, 255, 0.15)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </g>
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'center',
        marginTop: '8px'
      }}>
        <span style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          Don't have an account?
        </span>
        <a
          href="https://accounts.google.com/lifecycle/steps/signup/name?continue=https://myaccount.google.com?utm_source%3Daccount-marketing-page%26utm_medium%3Dcreate-account-button&dsh=S1260519615:1760958491735312&flowEntry=SignUp&flowName=GlifWebSignIn&TL=AMbiOOS0DD46ZJIPtlkHZL7FqpcbeoIwKudZ4EqBMLaTNy-fw1kWn-EZCnoZXkYr"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            background: 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white'
          }}
        >
          Sign up
        </a>
      </div>
      {error && (
        <p style={{
          color: '#fca5a5',
          marginTop: '1rem',
          fontSize: '0.875rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          borderRadius: '8px',
          border: '1px solid rgba(252, 165, 165, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
