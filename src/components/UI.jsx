// ── Modal ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-dark-800 border border-dark-700 rounded-2xl w-full ${sizes[size]} shadow-2xl animate-fade-up`}>
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10',
    blue:  'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red:   'text-red-400 bg-red-500/10',
    purple:'text-purple-400 bg-purple-500/10',
  }
  return (
    <div className="stat-card animate-fade-up">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'text-brand-400 bg-brand-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-sm text-dark-400">{label}</p>
        {sub && <p className="text-xs text-dark-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-400" />
      </div>
      <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-dark-400 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}

// ── Loading Spinner ────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${s[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}

// ── Page Header ────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">{title}</h1>
        {subtitle && <p className="text-dark-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Search Input ───────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 max-w-xs"
      />
    </div>
  )
}

// ── Confirm Dialog ─────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-up p-6">
        <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-dark-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ── Form Field ─────────────────────────────────────────
export function FormField({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}