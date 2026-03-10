import { useEffect, useState } from 'react';
import { getReportSummary } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/UI';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, ShoppingBag, TrendingUp, AlertCircle, Building2 } from 'lucide-react';

const MOCK_EARNINGS = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  distributor: Math.floor(Math.random() * 3000 + 500),
  sales: Math.floor(Math.random() * 8 + 2),
}));

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-zinc-400 font-medium mb-1 border-b border-zinc-800/50 pb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <p className="text-zinc-200">
            <span className="text-zinc-400">Earnings:</span> <span className="font-mono font-medium text-indigo-400">₹{Number(p.value).toLocaleString()}</span>
          </p>
        </div>
      ))}
    </div>
  );
  return null;
};

export default function DistributorDashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportSummary(14)
      .then(r => setData(r.data))
      .catch(() => setData({
        today: { count: 3, total: 45000 },
        month: { count: 45, total: 567000 },
        counts: { dealers: 12, active_warranties: 234, open_claims: 5 },
        earnings: MOCK_EARNINGS,
        topDealers: Array.from({ length: 5 }, (_, i) => ({ 
          name: `Shop ${i + 1}`, 
          sales: 20 - i * 3, 
          revenue: 50000 - i * 8000, 
          commission: 5000 - i * 800 
        })),
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  const stats = [
    { label: "Today's Sales",   value: data?.today?.count || 0,                                        icon: ShoppingBag, color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border border-indigo-500/20' },
    { label: "Today's Revenue", value: `₹${Number(data?.today?.total || 0).toLocaleString()}`,         icon: TrendingUp,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
    { label: 'Active Dealers',  value: data?.counts?.dealers || 0,                                     icon: Users,       color: 'text-blue-400',    bg: 'bg-blue-500/10 border border-blue-500/20' },
    { label: 'Open Claims',     value: data?.counts?.open_claims || 0,                                 icon: AlertCircle, color: 'text-amber-400',   bg: 'bg-amber-500/10 border border-amber-500/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-up font-sans">
      
      {/* Header */}
      <div>
        <h1 className="font-bold text-white text-3xl tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Partner'} 👋
        </h1>
        <p className="text-zinc-400 text-sm mt-1 font-medium">Here's your network overview and performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${s.bg}`}>
              <s.icon size={20} className={s.color}/>
            </div>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{s.value}</p>
            <p className="text-zinc-400 text-sm mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts & Lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Earnings Chart */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-white text-lg">Network Earnings</h3>
            <p className="text-xs text-zinc-400">Commission earned over the last 14 days</p>
          </div>
          
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.earnings || MOCK_EARNINGS} margin={{ left: -10, right: 5, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/> {/* Indigo */}
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <Area type="monotone" dataKey="distributor" stroke="#6366f1" strokeWidth={3} fill="url(#distGrad)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#18181b', strokeWidth: 2 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Dealers List */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/30">
            <h3 className="font-semibold text-white text-lg">Top Dealers</h3>
            <p className="text-xs text-zinc-400">By revenue generated</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 space-y-4">
            {(data?.topDealers || []).slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 shadow-inner ${
                  i === 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                  i === 1 ? 'bg-zinc-400/10 text-zinc-300 border border-zinc-400/20' : 
                  i === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                  'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
                }`}>
                  #{i + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium truncate group-hover:text-white transition-colors">{d.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{d.sales} sales recorded</p>
                </div>
                
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-indigo-400 block">
                    ₹{Number(d.revenue / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            ))}
            
            {(!data?.topDealers || data.topDealers.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50 pt-8">
                <Building2 size={32} className="text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-400">No dealer data yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}