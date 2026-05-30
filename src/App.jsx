import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import SearchPanel from './components/SearchPanel'
import LeadsTable from './components/LeadsTable'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Approvals from './pages/Approvals'
import { searchLeads, getLeads, exportCSV, getGmailStatus } from './services/api'

const FILTERS = ['all', 'new', 'contacted', 'replied', 'follow-up', 'rejected']

function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [lastSearch, setLastSearch] = useState(null)
  const [stats, setStats] = useState({ total: 0, withEmail: 0, avgScore: 0 })

  useEffect(() => { loadLeads() }, [])

  useEffect(() => {
    const withEmail = leads.filter(l => l.email).length
    const avgScore = leads.length
      ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length)
      : 0
    setStats({ total: leads.length, withEmail, avgScore })
  }, [leads])

  const loadLeads = async () => {
    setFetching(true)
    try {
      const res = await getLeads()
      setLeads(res.data)
    } catch (e) { setError('Failed to load leads') }
    setFetching(false)
  }

  const handleSearch = async (params) => {
    setLoading(true)
    setError(null)
    setLastSearch(params)
    try {
      await searchLeads(params)
      await loadLeads()
    } catch (e) {
      setError(e.response?.data?.detail || 'Search failed')
    }
    setLoading(false)
  }

  const handleUpdate = (id, data) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l))

  const handleDelete = (id) =>
    setLeads(prev => prev.filter(l => l.id !== id))

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  return (
    <div>
      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 24, marginBottom: 24,
        padding: '16px 20px', background: 'var(--bg-2)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: 2, color: 'var(--text)' }}>
          LEADS
        </h1>
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            { label: 'TOTAL', value: stats.total },
            { label: 'W/ EMAIL', value: stats.withEmail },
            { label: 'AVG SCORE', value: stats.avgScore },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={exportCSV} style={{
          background: 'none', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '8px 16px',
          color: 'var(--text-2)', fontFamily: 'var(--mono)',
          fontSize: 11, letterSpacing: 1, cursor: 'pointer'
        }}>EXPORT CSV ↓</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Search panel */}
        <div>
          <SearchPanel onSearch={handleSearch} loading={loading} />
          {lastSearch && (
            <div style={{
              marginTop: 10, padding: 12, background: 'var(--bg-2)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)'
            }}>
              <div style={{ color: 'var(--text-2)', marginBottom: 6 }}>LAST SEARCH</div>
              {lastSearch.titles?.length > 0 && <div>titles: {lastSearch.titles.join(', ')}</div>}
              {lastSearch.company_names?.length > 0 && <div>companies: {lastSearch.company_names.join(', ')}</div>}
              {lastSearch.locations?.length > 0 && <div>locations: {lastSearch.locations.join(', ')}</div>}
              <div>per_page: {lastSearch.per_page}</div>
            </div>
          )}
        </div>

        {/* Leads table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 12px', borderRadius: 4,
                  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1, cursor: 'pointer',
                  background: filter === f ? 'var(--accent)' : 'var(--bg-2)',
                  color: filter === f ? '#000' : 'var(--text-3)',
                  border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
                }}>{f.toUpperCase()}</button>
              ))}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
              {filteredLeads.length} leads
            </span>
          </div>

          {error && (
            <div style={{
              padding: 12, background: '#2a0a0a',
              border: '1px solid #ff444440', borderRadius: 'var(--radius)',
              color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: 12
            }}>{error}</div>
          )}

          {fetching ? (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 48, textAlign: 'center',
              fontFamily: 'var(--mono)', color: 'var(--text-3)', fontSize: 13
            }}>LOADING...</div>
          ) : (
            <LeadsTable leads={filteredLeads} onUpdate={handleUpdate} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  )
}

function AnalyticsPage() {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 48, textAlign: 'center'
    }}>
      <div style={{ fontFamily: 'var(--mono)', color: 'var(--text-3)', fontSize: 13 }}>
        ANALYTICS — COMING SOON
      </div>
      <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>
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
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar gmailConnected={gmailConnected} />
        <main style={{ marginLeft: 200, flex: 1, padding: 32, minHeight: '100vh' }}>
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