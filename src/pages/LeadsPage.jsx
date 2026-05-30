import { useState, useEffect } from 'react'
import SearchPanel from '../components/SearchPanel'
import LeadsTable from '../components/LeadsTable'
import { searchLeads, getLeads, exportCSV } from '../services/api'

const STATUSES = ['all', 'new', 'contacted', 'replied', 'follow-up', 'rejected']

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
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

  // Get unique companies for filter dropdown
  const companies = ['all', ...new Set(leads.map(l => l.company).filter(Boolean)).values()]

  // Apply both filters
  const filteredLeads = leads.filter(l => {
    const statusMatch = statusFilter === 'all' || l.status === statusFilter
    const companyMatch = companyFilter === 'all' || l.company === companyFilter
    return statusMatch && companyMatch
  })

  const btn = (active) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12,
    cursor: 'pointer', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent)' : 'var(--bg)',
    color: active ? '#fff' : 'var(--text-2)',
    fontWeight: active ? 500 : 400, transition: 'all 0.15s'
  })

  return (
    <div>
      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 24, marginBottom: 24,
        padding: '16px 20px', background: 'var(--bg-2)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        justifyContent: 'space-between', alignItems: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Leads</h1>
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'With Email', value: stats.withEmail },
            { label: 'Avg Score', value: stats.avgScore },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={exportCSV} style={{
          background: 'var(--bg)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '8px 16px',
          color: 'var(--text-2)', fontSize: 12, cursor: 'pointer'
        }}>Export CSV ↓</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Search panel */}
        <div>
          <SearchPanel onSearch={handleSearch} loading={loading} />
          {lastSearch && (
            <div style={{
              marginTop: 10, padding: 12, background: 'var(--bg-2)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              fontSize: 11, color: 'var(--text-3)'
            }}>
              <div style={{ fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Last Search</div>
              {lastSearch.titles?.length > 0 && <div>Titles: {lastSearch.titles.join(', ')}</div>}
              {lastSearch.company_names?.length > 0 && <div>Companies: {lastSearch.company_names.join(', ')}</div>}
              {lastSearch.locations?.length > 0 && <div>Locations: {lastSearch.locations.join(', ')}</div>}
              <div>Per page: {lastSearch.per_page}</div>
            </div>
          )}
        </div>

        {/* Leads table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Filters */}
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '12px 16px',
            display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
          }}>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 2 }}>Status:</span>
              {STATUSES.map(f => (
                <button key={f} onClick={() => setStatusFilter(f)} style={btn(statusFilter === f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

            {/* Company filter */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 2 }}>Company:</span>
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border-2)',
                  borderRadius: 6, padding: '5px 10px', color: 'var(--text)',
                  fontSize: 12, cursor: 'pointer'
                }}
              >
                {companies.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Companies' : c}</option>
                ))}
              </select>
            </div>

            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
              {filteredLeads.length} leads
            </span>
          </div>

          {error && (
            <div style={{
              padding: 12, background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 'var(--radius)',
              color: 'var(--danger)', fontSize: 12
            }}>{error}</div>
          )}

          {fetching ? (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 48, textAlign: 'center',
              color: 'var(--text-3)', fontSize: 13
            }}>Loading...</div>
          ) : (
            <LeadsTable leads={filteredLeads} onUpdate={handleUpdate} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  )
}