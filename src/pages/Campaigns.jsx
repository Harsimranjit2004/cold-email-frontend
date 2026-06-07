import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCampaigns, createCampaign, deleteCampaign, getResumes, uploadResume, deleteResume } from '../services/api'

const STATUS_COLORS = {
  draft:     { color: 'var(--text-2)', border: 'var(--border-2)' },
  active:    { color: 'var(--success)', border: '#10b98140' },
  paused:    { color: 'var(--warning)', border: '#f59e0b40' },
  completed: { color: 'var(--info)',    border: '#3b82f640' },
}

const DEFAULT_SEQUENCE = [
  { step: 1, delay_days: 0, attach_resume: false },
  { step: 2, delay_days: 2, attach_resume: true },
]

export default function Campaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', resume_filename: '' })
  const [sequence, setSequence] = useState(DEFAULT_SEQUENCE)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadCampaigns()
    loadResumes()
  }, [])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const res = await getCampaigns()
      setCampaigns(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadResumes = async () => {
    try {
      const res = await getResumes()
      setResumes(res.data)
    } catch (e) { console.error(e) }
  }

  const resetForm = () => {
    setForm({ name: '', resume_filename: '' })
    setSequence(DEFAULT_SEQUENCE.map(s => ({ ...s })))
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    const needsResume = sequence.some(s => s.attach_resume)
    if (needsResume && !form.resume_filename) {
      alert('A step attaches a resume — pick a resume below first.')
      return
    }
    try {
      await createCampaign({
        name: form.name,
        resume_filename: form.resume_filename || null,
        sequence,
      })
      setShowCreate(false)
      resetForm()
      loadCampaigns()
    } catch (e) { console.error(e) }
  }

  // --- sequence editing ---
  const updateStep = (i, patch) =>
    setSequence(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  const addStep = () =>
    setSequence(prev => [...prev, { step: prev.length + 1, delay_days: 3, attach_resume: true }])

  const removeStep = (i) =>
    setSequence(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, step: idx + 1 })))

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this campaign and all its emails?')) return
    try { await deleteCampaign(id); loadCampaigns() } catch (e) { console.error(e) }
  }

  const handleUploadResume = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try { await uploadResume(file); loadResumes() } catch (e) { console.error(e) }
    setUploading(false)
  }

  const handleDeleteResume = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return
    try { await deleteResume(filename); loadResumes() } catch (e) { console.error(e) }
  }

  const label = {
    fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block'
  }
  const input = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text)',
    fontSize: 13, marginBottom: 16
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: 16, letterSpacing: 2, color: 'var(--text)' }}>
            CAMPAIGNS
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>
            {campaigns.length} campaigns total
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
          padding: '10px 20px', color: '#fff', fontFamily: 'var(--mono)',
          fontSize: 12, letterSpacing: 1, cursor: 'pointer', fontWeight: 700
        }}>
          + NEW CAMPAIGN
        </button>
      </div>

      {showCreate && (
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', marginBottom: 20, letterSpacing: 2 }}>
            NEW CAMPAIGN
          </h3>

          <span style={label}>Campaign Name</span>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder='e.g. Scotiabank Outreach'
            style={input}
          />

          {/* Sequence editor */}
          <span style={label}>Email Sequence</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {sequence.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: 'var(--bg-3)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)'
              }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)',
                  minWidth: 60, fontWeight: 600
                }}>EMAIL {s.step}</span>

                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {s.step === 1 ? (
                    'sent on send / approve'
                  ) : (
                    <>
                      <input
                        type='number' min={1} max={30}
                        value={s.delay_days}
                        onChange={e => updateStep(i, { delay_days: Number(e.target.value) })}
                        style={{
                          width: 52, background: 'var(--bg)', border: '1px solid var(--border-2)',
                          borderRadius: 4, padding: '4px 6px', color: 'var(--text)',
                          fontSize: 13, marginRight: 6, textAlign: 'center'
                        }}
                      />
                      days after previous
                    </>
                  )}
                </span>

                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
                  fontSize: 12, color: 'var(--text-2)', cursor: 'pointer'
                }}>
                  <input
                    type='checkbox'
                    checked={s.attach_resume}
                    onChange={e => updateStep(i, { attach_resume: e.target.checked })}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  📎 attach resume
                </label>

                {sequence.length > 1 && (
                  <button onClick={() => removeStep(i)} style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                    padding: '3px 8px', color: 'var(--text-3)', fontSize: 11,
                    fontFamily: 'var(--mono)', cursor: 'pointer'
                  }}>×</button>
                )}
              </div>
            ))}

            {sequence.length < 4 && (
              <button onClick={addStep} style={{
                alignSelf: 'flex-start', background: 'none',
                border: '1px dashed var(--border-2)', borderRadius: 'var(--radius)',
                padding: '6px 14px', color: 'var(--text-2)', fontFamily: 'var(--mono)',
                fontSize: 11, cursor: 'pointer'
              }}>+ ADD FOLLOW-UP</button>
            )}
          </div>

          <span style={label}>Resume (used by any step with 📎 on)</span>
          <select
            value={form.resume_filename}
            onChange={e => setForm({ ...form, resume_filename: e.target.value })}
            style={{ ...input, marginBottom: 20 }}
          >
            <option value=''>No resume</option>
            {resumes.map(r => (
              <option key={r.filename} value={r.filename}>{r.filename} ({r.size_kb}kb)</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate} style={{
              background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
              padding: '10px 20px', color: '#fff', fontFamily: 'var(--mono)',
              fontSize: 12, letterSpacing: 1, cursor: 'pointer', fontWeight: 700
            }}>CREATE →</button>
            <button onClick={() => { setShowCreate(false); resetForm() }} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              padding: '10px 20px', color: 'var(--text-3)', fontFamily: 'var(--mono)',
              fontSize: 12, cursor: 'pointer'
            }}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Campaigns list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {loading ? (
          <div style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 12 }}>LOADING...</div>
        ) : campaigns.length === 0 ? (
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 48, textAlign: 'center',
            color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 12
          }}>NO CAMPAIGNS YET — CREATE ONE ABOVE</div>
        ) : campaigns.map(c => {
          const s = STATUS_COLORS[c.status] || STATUS_COLORS.draft
          const steps = c.sequence?.length || (c.follow_up_days?.length || 0) + 1
          return (
            <div key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)} style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '16px 20px',
              cursor: 'pointer', transition: 'border-color 0.15s', boxShadow: 'var(--shadow)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div>
                <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{c.name}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                  <span>{steps} emails</span>
                  {c.resume_filename && <span>📎 {c.resume_filename}</span>}
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 4, fontSize: 11,
                  fontFamily: 'var(--mono)', color: s.color,
                  border: `1px solid ${s.border}`, background: `${s.color}10`
                }}>{c.status.toUpperCase()}</span>
                <button onClick={(e) => handleDelete(c.id, e)} style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '4px 8px', color: 'var(--text-3)',
                  fontSize: 11, cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-3)' }}
                >del</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resume manager */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2 }}>
            RESUMES
          </h3>
          <label style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius)', padding: '6px 14px', color: 'var(--text-2)',
            fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', letterSpacing: 1
          }}>
            {uploading ? 'UPLOADING...' : '+ UPLOAD PDF'}
            <input type='file' accept='.pdf' onChange={handleUploadResume} style={{ display: 'none' }} />
          </label>
        </div>

        {resumes.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--mono)' }}>
            No resumes uploaded yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resumes.map(r => (
              <div key={r.filename} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'var(--bg-3)',
                borderRadius: 4, border: '1px solid var(--border)'
              }}>
                <div>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{r.filename}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8, fontFamily: 'var(--mono)' }}>
                    {r.size_kb}kb
                  </span>
                </div>
                <button onClick={() => handleDeleteResume(r.filename)} style={{
                  background: 'none', border: 'none', color: 'var(--text-3)',
                  fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mono)'
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
                >del</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}