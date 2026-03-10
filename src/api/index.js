import api from './axios'

// ── AUTH ──────────────────────────────────────────────
export const adminLogin        = (data)   => api.post('/auth/admin-login.php', data)
export const distributorLogin  = (data)   => api.post('/auth/distributor-login.php', data)
export const dealerLogin       = (data)   => api.post('/auth/dealer-login.php', data)

// ── DISTRIBUTORS (admin only) ─────────────────────────
export const getDistributors   = (params) => api.get('/distributors/index.php', { params })
export const getDistributor    = (id)     => api.get('/distributors/index.php', { params: { id } })
export const createDistributor = (data)   => api.post('/distributors/index.php', data)
export const updateDistributor = (data)   => api.put('/distributors/index.php', data)
export const deleteDistributor = (id)     => api.delete(`/distributors/index.php?id=${id}`)

// ── DEALERS ───────────────────────────────────────────
export const getDealers        = (params) => api.get('/dealers/index.php', { params })
export const getDealer         = (id)     => api.get('/dealers/index.php', { params: { id } })
export const createDealer      = (data)   => api.post('/dealers/index.php', data)
export const updateDealer      = (data)   => api.put('/dealers/index.php', data)
export const deleteDealer      = (id)     => api.delete(`/dealers/index.php?id=${id}`)

// ── DEALER USERS ──────────────────────────────────────
export const getDealerUsers    = (dealer_id) => api.get('/dealer-users/index.php', { params: { dealer_id } })
export const createDealerUser  = (data)      => api.post('/dealer-users/index.php', data)
export const updateDealerUser  = (data)      => api.put('/dealer-users/index.php', data)
export const deleteDealerUser  = (id)        => api.delete(`/dealer-users/index.php?id=${id}`)

// ── PLANS ─────────────────────────────────────────────
export const getPlans          = (params) => api.get('/plans/index.php', { params })
export const createPlan        = (data)   => api.post('/plans/index.php', data)
export const updatePlan        = (data)   => api.put('/plans/index.php', data)
export const deletePlan        = (id)     => api.delete(`/plans/index.php?id=${id}`)

// ── PRODUCTS ──────────────────────────────────────────
export const getProducts       = (params) => api.get('/products/index.php', { params })
export const createProduct     = (data)   => api.post('/products/index.php', data)
export const updateProduct     = (data)   => api.put('/products/index.php', data)
export const deleteProduct     = (id)     => api.delete(`/products/index.php?id=${id}`)

// ── SALES ─────────────────────────────────────────────
export const createSale        = (formData) => api.post('/sales/create.php', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getSales          = (params)   => api.get('/sales/index.php', { params })

// ── WARRANTY ──────────────────────────────────────────
export const getWarranties     = (params) => api.get('/warranty/index.php', { params })

// ── CLAIMS ────────────────────────────────────────────
export const getClaims         = (params)   => api.get('/claims/index.php', { params })
export const createClaim       = (formData) => api.post('/claims/index.php', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const updateClaim       = (data)     => api.put('/claims/index.php', data)

// ── WALLET ────────────────────────────────────────────
export const getWallet         = (dealer_id) => api.get('/wallet/index.php', { params: { dealer_id } })
export const creditWallet      = (data)      => api.post('/wallet/index.php', data)

// ── PAYMENTS (Razorpay) ───────────────────────────────
export const createPayOrder    = (amount) => api.post('/payments/create-order.php', { amount })
export const verifyPayment     = (data)   => api.post('/payments/verify.php', data)

// ── LOCATIONS ─────────────────────────────────────────
export const lookupPincode     = (pincode) => api.get('/locations/index.php', { params: { pincode } })
export const getLocations      = (params)  => api.get('/locations/index.php', { params })

// ── REPORTS ───────────────────────────────────────────
export const getReportSummary  = (days)   => api.get('/reports/summary.php', { params: { days } })
export const getDealerReport   = (id)     => api.get('/reports/dealer.php', { params: { id } })



// ── DEALER POLICIES ───────────────────────────────────
export const getDealerPolicies = (params) => api.get('/sales/index.php', { params })

// ── WALLET HISTORY ────────────────────────────────────
export const getWalletHistory  = (dealer_id) => api.get('/wallet/index.php', { params: { dealer_id } })
