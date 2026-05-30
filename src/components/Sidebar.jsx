import { NavLink } from 'react-router-dom'

const NAV = [
  { path: '/',           label: 'LEADS',      icon: '◎' },
  { path: '/campaigns',  label: 'CAMPAIGNS',  icon: '◈' },
  { path: '/approvals',  label: 'APPROVALS',  icon: '◉' },
  { path: '/analytics',  label: 'ANALYTICS',  icon: '◇' },
]

export default function Sidebar({ gmailConnected }) {
  return (
    <aside style={{
      width: 200,
      minHeight: '100vh',
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent)'
          }} />
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 12,
            letterSpacing: 3, color: 'var(--text)'
          }}>LEAD_GEN</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>
          v2.0
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {NAV.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: 1.5,
              color: isActive ? 'var(--accent)' : 'var(--text-3)',
              background: isActive ? 'rgba(0,255,136,0.05)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s'
            })}
          >
            <span style={{ fontSize: 14 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Gmail status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: gmailConnected ? 'var(--accent)' : 'var(--danger)'
          }} />
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            color: gmailConnected ? 'var(--accent)' : 'var(--danger)',
            letterSpacing: 1
          }}>
            {gmailConnected ? 'GMAIL ON' : 'GMAIL OFF'}
          </span>
        </div>
        {!gmailConnected && (
          <a
            href='http://localhost:8000/auth/google/login'
            target='_blank'
            rel='noreferrer'
            style={{
              display: 'block', marginTop: 8, fontSize: 10,
              fontFamily: 'var(--mono)', color: 'var(--text-3)',
              textDecoration: 'underline'
            }}
          >
            Connect Gmail →
          </a>
        )}
      </div>
    </aside>
  )
}