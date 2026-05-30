import { useState } from 'react'
import { updateLead, deleteLead } from '../services/api'

const STATUS_COLORS = {
  new:       { bg: '#0a2a1a', color: '#00ff88', border: '#00ff8840' },
  contacted: { bg: '#0a1a2a', color: '#4488ff', border: '#4488ff40' },
  replied:   { bg: '#1a2a0a', color: '#88ff44', border: '#88ff4440' },
  'follow-up': { bg: '#2a1a0a', color: '#ffaa00', border: '#ffaa0040' },
  rejected:  { bg: '#2a0a0a', color: '#ff4444', border: '#ff444440' },
}

const STATUSES = ['new', 'contacted', 'replied', 'follow-up', 'rejected']

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#00ff88' : score >= 50 ? '#ffaa00' : '#ff4444'
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: `2px solid ${color}`, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--mono)', fontSize: 11, color, fontWeight: 700
    }}>{score}</div>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new
  return (
    <span style={{
      padding: '3px 8px', borderRadius: 4, fontSize: 11,
      fontFamily: 'var(--mono)', background: s.bg,
      color: s.color, border: `1px solid ${s.border}`
    }}>{status}</span>
  )
}

function LeadRow({ lead, onUpdate, onDelete }) {
  const [status, setStatus] = useState(lead.status)
  const [updating, setUpdating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await updateLead(lead.id, { status: newStatus })
      setStatus(newStatus)
      onUpdate(lead.id, { status: newStatus })
    } catch (e) {
      console.error(e)
    }
    setUpdating(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${lead.name}?`)) return
    try {
      await deleteLead(lead.id)
      onDelete(lead.id)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        style={{
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'background 0.1s',
          background: expanded ? 'var(--bg-3)' : 'transparent'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
        onMouseLeave={e => e.currentTarget.style.background = expanded ? 'var(--bg-3)' : 'transparent'}
      >
        <td style={{ padding: '12px 16px' }}>
          <ScoreBadge score={lead.score} />
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{lead.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{lead.title}</div>
        </td>
        <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{lead.company}</td>
        <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{lead.location}</td>
        <td style={{ padding: '12px 16px' }}>
          {lead.email ? (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>
              {lead.email}
            </span>
          ) : (
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>
          )}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <StatusBadge status={status} />
        </td>
        <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updating}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border-2)',
                borderRadius: 4, padding: '4px 6px', color: 'var(--text-2)',
                fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer'
              }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleDelete} style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 4, padding: '4px 8px', color: 'var(--text-3)',
              fontSize: 11, cursor: 'pointer', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-3)' }}
            >del</button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
          <td colSpan={7} style={{ padding: '12px 16px 16px 68px' }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {lead.linkedin_url && (
                <a href={lead.linkedin_url} target='_blank' rel='noreferrer' style={{
                  fontSize: 12, color: 'var(--info)', fontFamily: 'var(--mono)',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  ↗ LinkedIn
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} style={{
                  fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--mono)',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  ✉ {lead.email}
                </a>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                Source: {lead.source}
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function LeadsTable({ leads, onUpdate, onDelete }) {
  if (!leads.length) return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 48, textAlign: 'center'
    }}>
      <div style={{ fontFamily: 'var(--mono)', color: 'var(--text-3)', fontSize: 13 }}>
        NO LEADS YET
      </div>
      <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>
        Use the search panel to find leads
      </div>
    </div>
  )

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Score', 'Person', 'Company', 'Location', 'Email', 'Status', 'Actions'].map(h => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: 'left', fontSize: 11,
                fontFamily: 'var(--mono)', color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: 1, fontWeight: 400
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}