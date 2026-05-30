import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCampaigns, getPendingApprovals, approveEmail, sendEmailNow } from '../services/api'

export default function Approvals() {
  const navigate = useNavigate()
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingEmail, setEditingEmail] = useState(null)
  const [sendingId, setSendingId] = useState(null)

  useEffect(() => {
    loadAllApprovals()
  }, [])

  const loadAllApprovals = async () => {
    setLoading(true)
    try {
      const campaigns = await getCampaigns()
      const all = []
      for (const c of campaigns.data) {
        const res = await getPendingApprovals(c.id)
        res.data.forEach(e => all.push({ ...e, campaign_name: c.name }))
      }
      setApprovals(all)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleApprove = async (emailId) => {
    try {
      const edit = editingEmail?.id === emailId ? editingEmail : null
      await approveEmail(emailId, {
        subject: edit?.subject,
        body: edit?.body,
        scheduled_at: edit?.scheduled_at
      })
      setEditingEmail(null)
      loadAllApprovals()
    } catch (e) { console.error(e) }
  }

  const handleSendNow = async (emailId) => {
    setSendingId(emailId)
    try {
      await sendEmailNow(emailId, { attach_resume: false })
      loadAllApprovals()
    } catch (e) { console.error(e) }
    setSendingId(null)
  }

  const mono = { fontFamily: 'var(--mono)' }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ ...mono, fontSize: 16, letterSpacing: 2, color: 'var(--text)' }}>
          APPROVAL QUEUE
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>
          {approvals.length} emails waiting for your approval
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', ...mono, fontSize: 12 }}>LOADING...</div>
      ) : approvals.length === 0 ? (
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 48, textAlign: 'center'
        }}>
          <div style={{ ...mono, color: 'var(--accent)', fontSize: 13 }}>ALL CLEAR</div>
          <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>
            No emails pending approval
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {approvals.map(email => (
            <div key={email.id} style={{
              background: 'var(--bg-2)', border: '1px solid #ffaa0030',
              borderRadius: 'var(--radius)', padding: 20
            }}>
              {/* Email header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: 'var(--text)', fontSize: 14 }}>
                      {email.leads?.name}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 10,
                      ...mono, color: '#ffaa00', background: '#2a1a0a',
                      border: '1px solid #ffaa0040'
                    }}>STEP {email.sequence_step}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', ...mono }}>
                    {email.leads?.title} @ {email.leads?.company}
                    <span style={{ marginLeft: 12, color: 'var(--text-3)' }}>→</span>
                    <span style={{ marginLeft: 8, color: 'var(--text-2)' }}>{email.leads?.email}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', ...mono }}>{email.campaign_name}</div>
                  <button
                    onClick={() => navigate(`/campaigns/${email.campaign_id}`)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--info)',
                      fontSize: 11, ...mono, cursor: 'pointer', marginTop: 4, padding: 0
                    }}
                  >view campaign →</button>
                </div>
              </div>

              {/* Email content */}
              {editingEmail?.id === email.id ? (
                <div>
                  <input
                    value={editingEmail.subject}
                    onChange={e => setEditingEmail({ ...editingEmail, subject: e.target.value })}
                    style={{
                      width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
                      borderRadius: 4, padding: '7px 10px', color: 'var(--text)',
                      fontSize: 12, marginBottom: 8, ...mono
                    }}
                  />
                  <textarea
                    value={editingEmail.body}
                    onChange={e => setEditingEmail({ ...editingEmail, body: e.target.value })}
                    rows={10}
                    style={{
                      width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
                      borderRadius: 4, padding: '8px 10px', color: 'var(--text)',
                      fontSize: 12, resize: 'vertical', marginBottom: 8, lineHeight: 1.6
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', ...mono }}>SCHEDULE SEND:</span>
                    <input
                      type='datetime-local'
                      value={editingEmail.scheduled_at || ''}
                      onChange={e => setEditingEmail({ ...editingEmail, scheduled_at: e.target.value })}
                      style={{
                        background: 'var(--bg)', border: '1px solid var(--border-2)',
                        borderRadius: 4, padding: '5px 8px', color: 'var(--text)', fontSize: 12
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 12, color: 'var(--accent)', ...mono,
                    marginBottom: 8, padding: '6px 10px',
                    background: 'var(--bg-3)', borderRadius: 4,
                    border: '1px solid var(--border)'
                  }}>
                    Subject: {email.subject}
                  </div>
                  <div style={{
                    fontSize: 13, color: 'var(--text-2)', whiteSpace: 'pre-wrap',
                    background: 'var(--bg)', padding: 14, borderRadius: 4,
                    border: '1px solid var(--border)', lineHeight: 1.7,
                    maxHeight: 200, overflowY: 'auto'
                  }}>
                    {email.body}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleApprove(email.id)} style={{
                  background: 'var(--accent)', border: 'none', borderRadius: 4,
                  padding: '8px 18px', color: '#000', ...mono,
                  fontSize: 12, cursor: 'pointer', fontWeight: 700, letterSpacing: 1
                }}>✓ APPROVE</button>

                <button onClick={() => handleSendNow(email.id)} disabled={sendingId === email.id} style={{
                  background: 'none', border: '1px solid var(--accent)', borderRadius: 4,
                  padding: '8px 18px', color: 'var(--accent)', ...mono,
                  fontSize: 12, cursor: 'pointer', letterSpacing: 1
                }}>{sendingId === email.id ? 'SENDING...' : '→ SEND NOW'}</button>

                <button onClick={() => setEditingEmail(
                  editingEmail?.id === email.id ? null : { ...email }
                )} style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                  padding: '8px 18px', color: 'var(--text-3)', ...mono,
                  fontSize: 12, cursor: 'pointer', letterSpacing: 1
                }}>{editingEmail?.id === email.id ? 'CANCEL' : '✎ EDIT'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}