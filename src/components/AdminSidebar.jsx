import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Package, BarChart3, Wallet,
  LogOut, ChevronRight, Shield, Truck, ShoppingBag, AlertCircle, Box
} from 'lucide-react'

const links = [
  { to: '/admin',             label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/distributors', label: 'Distributors', icon: Truck },
  { to: '/admin/dealers',      label: 'Dealers',      icon: Users },
  { to: '/admin/plans',        label: 'Plans',        icon: Package },
  { to: '/admin/products',     label: 'Products',     icon: Box },
  { to: '/admin/sales',        label: 'Sales',        icon: ShoppingBag },
  { to: '/admin/claims',       label: 'Claims',       icon: AlertCircle },
  { to: '/admin/wallet',       label: 'Wallet',       icon: Wallet },
  { to: '/admin/reports',      label: 'Reports',      icon: BarChart3 },
]

export default function AdminSidebar({ open, setOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-2xl lg:shadow-none`}
      >
        {/* Header / Logo */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-none tracking-tight">Carezo</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar mt-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={end}
              onClick={() => { if(window.innerWidth < 1024) setOpen(false) }}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group border ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-inner' 
                    : 'text-zinc-400 border-transparent hover:bg-zinc-900 hover:text-zinc-200'
                }`
              }
            >
              <Icon size={18} className="transition-transform group-hover:scale-110 duration-200" />
              <span className="flex-1">{label}</span>
              <ChevronRight 
                size={14} 
                className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" 
              />
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm shadow-inner">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Super Admin</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => { logout(); navigate('/admin/login') }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut size={16} /> 
            Logout Session
          </button>
        </div>
      </aside>
    </>
  )
}