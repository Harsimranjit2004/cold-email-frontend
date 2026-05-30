import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCampaign, getLeads, addLeadsToCampaign,
  getPendingApprovals, approveEmail, approveAllEmails,
  sendEmailNow, updateCampaignStatus, getResumes
} from '../services/api'

const STATUS_COLORS = {
  pending_approval: { color: '#ffaa00', bg: '#2a1a0a' },
  pending:          { color: '#4488ff', bg: '#0a1a2a' },
  sent:             { color: '#00ff88', bg: '#0a2a1a' },
  replied:          { color: '#88ff44', bg: '#1a2a0a' },
  failed:           { color: '#ff4444', bg: '#2a0a0a' },
  cancelled:        { color: '#555',    bg: '#1a1a1a' },
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [emails, setEmails] = useState([])
  const [leads, setLeads] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [attachResume, setAttachResume] = useState(false)
  const [scheduleStart, setScheduleStart] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddLeads, setShowAddLeads] = useState(false)
  const [editingEmail, setEditingEmail] = useState(null)
  const [sendingId, setSendingId] = useState(null)

  useEffect(() => {
    loadCampaign()
    loadLeads()
    loadResumes()
  }, [id])

  const loadCampaign = async () => {
    setLoading(true)
    try {
      const res = await getCampaign(id)
      setCampaign(res.data)
      setEmails(res.data.emails || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadLeads = async () => {
    try {
      const res = await getLeads()
      setLeads(res.data)
    } catch (e) { console.error(e) }
  }

  const loadResumes = async () => {
    try {
      const res = await getResumes()
      setResumes(res.data)
    } catch (e) { console.error(e) }
  }

  const handleAddLeads = async () => {
    if (!selectedLeads.length) return
    setAdding(true)
    try {
      await addLeadsToCampaign(id, {
        lead_ids: selectedLeads,
        attach_resume: attachResume,
        schedule_start: scheduleStart || undefined
      })
      setSelectedLeads([])
      setShowAddLeads(false)
      loadCampaign()
    } catch (e) { console.error(e) }
    setAdding(false)
  }

  const handleApprove = async (emailId) => {
    try {
      const edit = editingEmail?.id === emailId ? editingEmail : null
      await approveEmail(emailId, {
        subject: edit?.subject,
        body: edit?.body,
        scheduled_at: edit?.scheduled_at,
        attach_resume: edit?.attach_resume
      })
      setEditingEmail(null)
      loadCampaign()
    } catch (e) { console.error(e) }
  }

  const handleApproveAll = async () => {
    try {
      await approveAllEmails(id)
      loadCampaign()
    } catch (e) { console.error(e) }
  }

  const handleSendNow = async (emailId) => {
    setSendingId(emailId)
    try {
      await sendEmailNow(emailId, { attach_resume: false })
      loadCampaign()
    } catch (e) { console.error(e) }
    setSendingId(null)
  }

  const handleStatusChange = async (status) => {
    try {
      await updateCampaignStatus(id, status)
      loadCampaign()
    } catch (e) { console.error(e) }
  }

  const pendingApprovals = emails.filter(e => e.status === 'pending_approval')
  const sentEmails = emails.filter(e => e.status === 'sent')
  const pendingEmails = emails.filter(e => e.status === 'pending')

  if (loading) return (
    <div style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 12 }}>LOADING...</div>
  )

  if (!campaign) return (
    <div style={{ color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: 12 }}>Campaign not found</div>
  )

  const mono = { fontFamily: 'var(--mono)' }
  const card = {
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 20, marginBottom: 16
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <button onClick={() => navigate('/campaigns')} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', marginBottom: 8, padding: 0
          }}>← CAMPAIGNS</button>
          <h1 style={{ ...mono, fontSize: 16, letterSpacing: 2, color: 'var(--text)' }}>
            {campaign.name.toUpperCase()}
          </h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: 'var(--text-3)', ...mono }}>
            <span>Follow-ups: day {campaign.follow_up_days?.join(', ')}</span>
            {campaign.resume_filename && <span>📎 {campaign.resume_filename}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['active', 'paused', 'completed'].map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} style={{
              padding: '6px 12px', borderRadius: 4, fontSize: 11, ...mono,
              cursor: 'pointer', letterSpacing: 1,
              background: campaign.status === s ? 'var(--accent)' : 'var(--bg-3)',
              color: campaign.status === s ? '#000' : 'var(--text-3)',
              border: `1px solid ${campaign.status === s ? 'var(--accent)' : 'var(--border)'}`,
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'TOTAL EMAILS', value: emails.length },
          { label: 'PENDING APPROVAL', value: pendingApprovals.length },
          { label: 'SENT', value: sentEmails.length },
          { label: 'REPLIED', value: emails.filter(e => e.status === 'replied').length },
        ].map(s => (
          <div key={s.label} style={{
            ...card, marginBottom: 0, textAlign: 'center', padding: 16
          }}>
            <div style={{ fontSize: 24, color: 'var(--accent)', ...mono }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', ...mono, letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Leads */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAddLeads ? 16 : 0 }}>
          <h3 style={{ ...mono, fontSize: 11, color: 'var(--text-3)', letterSpacing: 2 }}>ADD LEADS</h3>
          <button onClick={() => setShowAddLeads(!showAddLeads)} style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            borderRadius: 4, padding: '6px 12px', color: 'var(--text-2)',
            ...mono, fontSize: 11, cursor: 'pointer'
          }}>{showAddLeads ? 'CANCEL' : '+ ADD LEADS'}</button>
        </div>

        {showAddLeads && (
          <div>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
              {leads.filter(l => l.email).map(lead => (
                <label key={lead.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer'
                }}>
                  <input
                    type='checkbox'
                    checked={selectedLeads.includes(lead.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedLeads([...selectedLeads, lead.id])
                      else setSelectedLeads(selectedLeads.filter(i => i !== lead.id))
                    }}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <span style={{ color: 'var(--text)', fontSize: 13 }}>{lead.name}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 8, ...mono }}>
                      {lead.title} @ {lead.company}
                    </span>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', ...mono }}>
                    {lead.score}pts
                  </span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                <input
                  type='checkbox'
                  checked={attachResume}
                  onChange={e => setAttachResume(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                Attach resume
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', ...mono }}>SCHEDULE START:</span>
                <input
                  type='datetime-local'
                  value={scheduleStart}
                  onChange={e => setScheduleStart(e.target.value)}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border-2)',
                    borderRadius: 4, padding: '5px 8px', color: 'var(--text)',
                    fontSize: 12
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAddLeads} disabled={adding || !selectedLeads.length} style={{
                background: selectedLeads.length ? 'var(--accent)' : 'var(--bg-3)',
                border: 'none', borderRadius: 4, padding: '8px 16px',
                color: selectedLeads.length ? '#000' : 'var(--text-3)',
                ...mono, fontSize: 12, cursor: selectedLeads.length ? 'pointer' : 'not-allowed', fontWeight: 700
              }}>
                {adding ? 'GENERATING...' : `ADD ${selectedLeads.length} LEADS →`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...mono, fontSize: 11, color: '#ffaa00', letterSpacing: 2 }}>
              PENDING APPROVAL ({pendingApprovals.length})
            </h3>
            <button onClick={handleApproveAll} style={{
              background: 'none', border: '1px solid #ffaa0040', borderRadius: 4,
              padding: '6px 12px', color: '#ffaa00', ...mono, fontSize: 11, cursor: 'pointer'
            }}>APPROVE ALL</button>
          </div>

          {pendingApprovals.map(email => (
            <div key={email.id} style={{
              border: '1px solid var(--border)', borderRadius: 4,
              padding: 16, marginBottom: 12, background: 'var(--bg-3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                    {email.leads?.name}
                  </span>
                  <span style={{ color: 'var(--text-3)', fontSize: 12, marginLeft: 8, ...mono }}>
                    {email.leads?.title} @ {email.leads?.company}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', ...mono }}>
                  Step {email.sequence_step}
                </span>
              </div>

              {editingEmail?.id === email.id ? (
                <div>
                  <input
                    value={editingEmail.subject}
                    onChange={e => setEditingEmail({ ...editingEmail, subject: e.target.value })}
                    style={{
                      width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
                      borderRadius: 4, padding: '6px 10px', color: 'var(--text)',
                      fontSize: 12, marginBottom: 8, ...mono
                    }}
                  />
                  <textarea
                    value={editingEmail.body}
                    onChange={e => setEditingEmail({ ...editingEmail, body: e.target.value })}
                    rows={8}
                    style={{
                      width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
                      borderRadius: 4, padding: '8px 10px', color: 'var(--text)',
                      fontSize: 12, resize: 'vertical', marginBottom: 8
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', ...mono }}>SEND AT:</span>
                    <input
                      type='datetime-local'
                      value={editingEmail.scheduled_at || ''}
                      onChange={e => setEditingEmail({ ...editingEmail, scheduled_at: e.target.value })}
                      style={{
                        background: 'var(--bg)', border: '1px solid var(--border-2)',
                        borderRadius: 4, padding: '4px 8px', color: 'var(--text)', fontSize: 12
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--accent)', ...mono, marginBottom: 6 }}>
                    {email.subject}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text-2)', whiteSpace: 'pre-wrap',
                    background: 'var(--bg)', padding: 10, borderRadius: 4,
                    border: '1px solid var(--border)', maxHeight: 150, overflowY: 'auto'
                  }}>
                    {email.body}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => handleApprove(email.id)} style={{
                  background: 'var(--accent)', border: 'none', borderRadius: 4,
                  padding: '6px 14px', color: '#000', ...mono,
                  fontSize: 11, cursor: 'pointer', fontWeight: 700
                }}>APPROVE</button>

                <button onClick={() => sendEmailNow(email.id, { attach_resume: false }).then(loadCampaign)} style={{
                  background: 'none', border: '1px solid var(--accent)', borderRadius: 4,
                  padding: '6px 14px', color: 'var(--accent)', ...mono,
                  fontSize: 11, cursor: 'pointer'
                }}>SEND NOW</button>

                <button onClick={() => setEditingEmail(editingEmail?.id === email.id ? null : { ...email })} style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                  padding: '6px 14px', color: 'var(--text-3)', ...mono,
                  fontSize: 11, cursor: 'pointer'
                }}>{editingEmail?.id === email.id ? 'CANCEL' : 'EDIT'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Emails */}
      <div style={card}>
        <h3 style={{ ...mono, fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 16 }}>
          ALL EMAILS ({emails.length})
        </h3>

        {emails.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: 12, ...mono }}>No emails yet — add leads above</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Lead', 'Subject', 'Step', 'Status', 'Scheduled', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left', fontSize: 10,
                    ...mono, color: 'var(--text-3)', letterSpacing: 1, fontWeight: 400
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emails.map(email => {
                const s = STATUS_COLORS[email.status] || {}
                return (
                  <tr key={email.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: 13 }}>
                      <div style={{ color: 'var(--text)' }}>{email.leads?.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{email.leads?.company}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-2)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {email.subject}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-3)', ...mono }}>
                      {email.sequence_step}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10,
                        ...mono, color: s.color, background: s.bg,
                        border: `1px solid ${s.color}40`
                      }}>{email.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-3)', ...mono }}>
                      {email.scheduled_at ? new Date(email.scheduled_at).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {email.status === 'pending_approval' && (
                        <button onClick={() => handleApprove(email.id)} style={{
                          background: 'none', border: '1px solid #ffaa0060',
                          borderRadius: 4, padding: '3px 8px', color: '#ffaa00',
                          fontSize: 10, ...mono, cursor: 'pointer'
                        }}>APPROVE</button>
                      )}
                      {(email.status === 'pending' || email.status === 'pending_approval') && (
                        <button onClick={() => handleSendNow(email.id)} disabled={sendingId === email.id} style={{
                          background: 'none', border: '1px solid var(--accent)',
                          borderRadius: 4, padding: '3px 8px', color: 'var(--accent)',
                          fontSize: 10, ...mono, cursor: 'pointer', marginLeft: 4
                        }}>{sendingId === email.id ? '...' : 'SEND'}</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}