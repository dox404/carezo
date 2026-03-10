import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, ClipboardList, Wallet, Shield, Menu, X, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/dealer',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dealer/sell',     label: 'Sell Plan', icon: ShoppingCart },
  { to: '/dealer/sales',    label: 'My Sales',  icon: ClipboardList },
  { to: '/dealer/warranty', label: 'Warranty',  icon: ShieldCheck },
  { to: '/dealer/claims',   label: 'Claims',    icon: AlertCircle },
  { to: '/dealer/wallet',   label: 'Wallet',    icon: Wallet },
];

export default function DealerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50 font-sans transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield size={18} className="text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-bold text-white leading-none tracking-tight">Carezo</span>
            {user?.shop_name && (
              <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">
                {user.shop_name}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={end}
              className={({ isActive }) => 
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Wallet Snippet */}
          <div 
            onClick={() => navigate('/dealer/wallet')}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
            title="Go to Wallet"
          >
            <Wallet size={14} className="text-emerald-400" />
            <span className="text-sm font-bold text-zinc-200 font-mono tracking-tight">
              ₹{Number(user?.wallet || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-200 leading-none">{user?.name || 'Partner'}</p>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">{user?.user_role || 'Dealer'}</p>
            </div>
            <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm shadow-inner">
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </div>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={() => { logout(); navigate('/dealer/login'); }} 
            className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 rounded-xl border border-zinc-800 transition-colors" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 animate-fade-down shadow-2xl">
          <div className="px-4 py-4 space-y-1.5">
            
            {/* Mobile Wallet Display */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  {user?.name?.[0]?.toUpperCase() || 'D'}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{user?.name}</p>
                  <p className="text-xs text-zinc-500">{user?.shop_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-0.5">Wallet Balance</p>
                <p className="text-sm font-bold font-mono text-emerald-400">
                  ₹{Number(user?.wallet || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Mobile Links */}
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink 
                key={to} 
                to={to} 
                end={end} 
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            
            {/* Mobile Logout */}
            <button 
              onClick={() => { logout(); navigate('/dealer/login'); }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors mt-4 border border-transparent"
            >
              <LogOut size={18} />
              Sign Out
            </button>
            
          </div>
        </div>
      )}
    </header>
  );
}