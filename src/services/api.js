import axios from 'axios'

const api = axios.create({
  baseURL: 'https://cold-email-system-z6fn.onrender.com',
  headers: { 'Content-Type': 'application/json' }
})

// Leads
export const searchLeads = (params) => api.post('/leads/search', params)
export const getLeads = (status = null) => api.get('/leads/', { params: status ? { status } : {} })
export const updateLead = (id, data) => api.patch(`/leads/${id}`, data)
export const deleteLead = (id) => api.delete(`/leads/${id}`)
export const exportCSV = () => window.open('https://cold-email-system-z6fn.onrender.com/export/csv', '_blank')

// Campaigns
export const getCampaigns = () => api.get('/campaigns/')
export const getCampaign = (id) => api.get(`/campaigns/${id}`)
export const createCampaign = (data) => api.post('/campaigns/', data)
export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`)
export const updateCampaignStatus = (id, status) => api.patch(`/campaigns/${id}/status`, null, { params: { status } })
export const addLeadsToCampaign = (campaignId, data) => api.post(`/campaigns/${campaignId}/leads`, data)
export const getPendingApprovals = (campaignId) => api.get(`/campaigns/${campaignId}/approvals`)
export const approveEmail = (emailId, data) => api.post(`/campaigns/approve/${emailId}`, { email_id: emailId, ...data })
export const approveAllEmails = (campaignId) => api.post(`/campaigns/approve-all/${campaignId}`)
export const sendEmailNow = (emailId, data) => api.post(`/campaigns/send-now/${emailId}`, data)

// Resumes
export const getResumes = () => api.get('/resumes/')
export const deleteResume = (filename) => api.delete(`/resumes/${filename}`)
export const uploadResume = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Auth
export const getGmailStatus = () => api.get('/auth/google/status')