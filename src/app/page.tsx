'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      padding: '1rem'
    }}>
      <div style={{
        position: 'relative',
        width: '8rem',
        height: '8rem'
      }}>
        <img
          src="/logo.svg"
          alt="HydraLearn Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem' }}>
          HydraLearn
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          AI-powered educational platform for students, teachers, and administrators.
          Generate lesson plans, assessments, and learning materials grounded in pedagogical theory.
        </p>
        <Link href="/dashboard">
          <a style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '0.5rem',
            fontWeight: 'medium',
            textDecoration: 'none'
          }}>
            Go to Dashboard
          </a>
        </Link>
      </div>
    </div>
  )
}
