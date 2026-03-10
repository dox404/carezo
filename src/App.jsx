import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import AdminLayout        from './layouts/AdminLayout'
import DealerLayout       from './layouts/DealerLayout'
import DistributorLayout  from './layouts/DistributorLayout'

// Admin Pages
import AdminLogin         from './pages/admin/Login'
import AdminDashboard     from './pages/admin/Dashboard'
import AdminDistributors  from './pages/admin/Distributors'
import AdminDealers       from './pages/admin/Dealers'
import AdminPlans         from './pages/admin/Plans'
import AdminSales         from './pages/admin/Sales'
import AdminWallet        from './pages/admin/Wallet'
import AdminReports       from './pages/admin/Reports'
import AdminProducts      from './pages/admin/Products'
import AdminClaims        from './pages/admin/Claims'

// Distributor Pages
import DistributorLogin   from './pages/distributor/Login'
import DistributorDash    from './pages/distributor/Dashboard'
import DistributorDealers from './pages/distributor/Dealers'
import DistributorSales   from './pages/distributor/Sales'
import DistributorClaims  from './pages/distributor/Claims'

// Dealer Pages
import DealerLogin        from './pages/dealer/Login'
import DealerDashboard    from './pages/dealer/Dashboard'
import SellPlan           from './pages/dealer/SellPlan'
import SoldPlans          from './pages/dealer/SoldPlans'
import DealerWallet       from './pages/dealer/Wallet'
import DealerWarranty     from './pages/dealer/Warranty'
import DealerClaims       from './pages/dealer/Claims'

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b27', color: '#d8dfee',
            border: '1px solid #1e2335',
            fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: '14px'
          },
          success: { iconTheme: { primary: '#0fb98d', secondary: '#0d1017' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0d1017' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dealer/login" replace />} />

          {/* ── ADMIN ───────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index                element={<AdminDashboard />} />
            <Route path="distributors"  element={<AdminDistributors />} />
            <Route path="dealers"       element={<AdminDealers />} />
            <Route path="plans"         element={<AdminPlans />} />
            <Route path="products"      element={<AdminProducts />} />
            <Route path="sales"         element={<AdminSales />} />
            <Route path="claims"        element={<AdminClaims />} />
            <Route path="wallet"        element={<AdminWallet />} />
            <Route path="reports"       element={<AdminReports />} />
          </Route>

          {/* ── DISTRIBUTOR ─────────────────────────── */}
          <Route path="/distributor/login" element={<DistributorLogin />} />
          <Route path="/distributor" element={<ProtectedRoute role="distributor"><DistributorLayout /></ProtectedRoute>}>
            <Route index          element={<DistributorDash />} />
            <Route path="dealers" element={<DistributorDealers />} />
            <Route path="sales"   element={<DistributorSales />} />
            <Route path="claims"  element={<DistributorClaims />} />
          </Route>

          {/* ── DEALER ──────────────────────────────── */}
          <Route path="/dealer/login" element={<DealerLogin />} />
          <Route path="/dealer" element={<ProtectedRoute role="dealer_user"><DealerLayout /></ProtectedRoute>}>
            <Route index           element={<DealerDashboard />} />
            <Route path="sell"     element={<SellPlan />} />
            <Route path="sales"    element={<SoldPlans />} />
            <Route path="warranty" element={<DealerWarranty />} />
            <Route path="claims"   element={<DealerClaims />} />
            <Route path="wallet"   element={<DealerWallet />} />
          </Route>

          <Route path="*" element={<Navigate to="/dealer/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}