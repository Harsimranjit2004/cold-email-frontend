import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LeadsPage from './pages/LeadsPage'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Approvals from './pages/Approvals'
import { getGmailStatus } from './services/api'

function AnalyticsPage() {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 48, textAlign: 'center'
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-2)', fontSize: 14 }}>Analytics — Coming Soon</div>
      <div style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 8 }}>
        Open rates, reply rates, campaign performance
      </div>
    </div>
  )
}

export default function App() {
  const [gmailConnected, setGmailConnected] = useState(false)

  useEffect(() => {
    getGmailStatus()
      .then(res => setGmailConnected(res.data.connected))
      .catch(() => setGmailConnected(false))
  }, [])

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-2)' }}>
        <Sidebar gmailConnected={gmailConnected} />
        <main style={{ marginLeft: 220, flex: 1, padding: 28, minHeight: '100vh' }}>
          <Routes>
            <Route path='/' element={<LeadsPage />} />
            <Route path='/campaigns' element={<Campaigns />} />
            <Route path='/campaigns/:id' element={<CampaignDetail />} />
            <Route path='/approvals' element={<Approvals />} />
            <Route path='/analytics' element={<AnalyticsPage />} />
            <Route path='*' element={<Navigate to='/' />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}