import { useState } from 'react'

const SENIORITIES = ['c_suite', 'vp', 'head', 'director', 'manager', 'senior']
const EMP_RANGES = [
  { label: '1–10', value: '1,10' },
  { label: '11–50', value: '11,50' },
  { label: '51–200', value: '51,200' },
  { label: '201–500', value: '201,500' },
  { label: '500+', value: '500,100000' },
]

function TagInput({ placeholder, value, onChange }) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setInput('')
  }

  const remove = (item) => onChange(value.filter(i => i !== item))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'var(--bg)', border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
            fontSize: 13
          }}
        />
        <button onClick={add} style={{
          background: 'var(--bg-3)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text-2)',
          fontSize: 13
        }}>Add</button>
      </div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map(v => (
            <span key={v} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '3px 8px', fontSize: 12,
              color: 'var(--text-2)', fontFamily: 'var(--mono)'
            }}>
              {v}
              <button onClick={() => remove(v)} style={{
                background: 'none', color: 'var(--text-3)', fontSize: 14,
                lineHeight: 1, padding: 0
              }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPanel({ onSearch, loading }) {
  const [titles, setTitles] = useState([])
  const [companies, setCompanies] = useState([])
  const [locations, setLocations] = useState(['Toronto, Canada'])
  const [keywords, setKeywords] = useState([])
  const [seniorities, setSeniorities] = useState([])
  const [empRanges, setEmpRanges] = useState([])
  const [perPage, setPerPage] = useState(10)

  const toggleSeniority = (s) =>
    setSeniorities(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleEmpRange = (r) =>
    setEmpRanges(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])

  const handleSearch = () => {
    onSearch({
      titles: titles.length ? titles : undefined,
      company_names: companies.length ? companies : undefined,
      locations: locations.length ? locations : ['Toronto, Canada'],
      keywords: keywords.length ? keywords : undefined,
      seniorities: seniorities.length ? seniorities : undefined,
      employee_ranges: empRanges.length ? empRanges : undefined,
      per_page: perPage,
      page: 1
    })
  }

  const label = {
    fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'block'
  }

  const section = { marginBottom: 20 }

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 24, display: 'flex',
      flexDirection: 'column', gap: 4
    }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: 2 }}>
          SEARCH LEADS
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>
          Powered by Apollo.io — enrichment costs credits
        </p>
      </div>

      <div style={section}>
        <span style={label}>Job Titles</span>
        <TagInput placeholder='e.g. Engineering Manager' value={titles} onChange={setTitles} />
      </div>

      <div style={section}>
        <span style={label}>Companies</span>
        <TagInput placeholder='e.g. Shopify, Wealthsimple' value={companies} onChange={setCompanies} />
      </div>

      <div style={section}>
        <span style={label}>Locations</span>
        <TagInput placeholder='e.g. Toronto, Canada' value={locations} onChange={setLocations} />
      </div>

      <div style={section}>
        <span style={label}>Keywords</span>
        <TagInput placeholder='e.g. TypeScript, Node.js' value={keywords} onChange={setKeywords} />
      </div>

      <div style={section}>
        <span style={label}>Seniority</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SENIORITIES.map(s => (
            <button key={s} onClick={() => toggleSeniority(s)} style={{
              padding: '5px 12px', borderRadius: 4, fontSize: 12,
              fontFamily: 'var(--mono)', cursor: 'pointer',
              background: seniorities.includes(s) ? 'var(--accent)' : 'var(--bg-3)',
              color: seniorities.includes(s) ? '#000' : 'var(--text-2)',
              border: `1px solid ${seniorities.includes(s) ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.15s'
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={section}>
        <span style={label}>Company Size</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMP_RANGES.map(r => (
            <button key={r.value} onClick={() => toggleEmpRange(r.value)} style={{
              padding: '5px 12px', borderRadius: 4, fontSize: 12,
              fontFamily: 'var(--mono)', cursor: 'pointer',
              background: empRanges.includes(r.value) ? 'var(--accent)' : 'var(--bg-3)',
              color: empRanges.includes(r.value) ? '#000' : 'var(--text-2)',
              border: `1px solid ${empRanges.includes(r.value) ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.15s'
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      <div style={{ ...section, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ ...label, marginBottom: 0 }}>Results per search</span>
        <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} style={{
          background: 'var(--bg)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '6px 10px',
          color: 'var(--text)', fontSize: 13
        }}>
          {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n} leads</option>)}
        </select>
      </div>

      <button onClick={handleSearch} disabled={loading} style={{
        marginTop: 8, padding: '12px', borderRadius: 'var(--radius)',
        background: loading ? 'var(--bg-3)' : 'var(--accent)',
        color: loading ? 'var(--text-3)' : '#000',
        fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
        letterSpacing: 1, cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', border: 'none'
      }}>
        {loading ? 'SEARCHING...' : 'SEARCH →'}
      </button>
    </div>
  )
}