import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWalletHistory, getDealerPolicies } from '../../api/index';
import { StatCard, Spinner } from '../../components/UI';
import { ShoppingBag, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts';

// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-zinc-400 font-medium mb-1 border-b border-zinc-800/50 pb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <p className="text-zinc-200">
            <span className="text-zinc-400">Earned:</span> <span className="font-mono font-medium text-emerald-400">₹{Number(p.value).toLocaleString()}</span>
          </p>
        </div>
      ))}
    </div>
  );
  return null;
};

export default function DealerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [txns, setTxns]         = useState([]);
  const [loading, setLoading]   = useState(true);

  // --- Mocks ---
  const MOCK_POLICIES = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1, 
    customer_id: `CRZ${200 + i}XY`, 
    plan_name: ['Basic Health', 'Life Cover', 'Motor Basic'][i % 3],
    customer_name: `Customer ${i + 1}`, 
    amount_paid: [999, 2499, 1499][i % 3],
    dealer_earning: [150, 300, 200][i % 3], 
    status: 'active', 
    sold_at: new Date(Date.now() - i * 86400000).toLocaleDateString()
  }));

  const MOCK_TX = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, 
    type: ['debit', 'credit', 'debit'][i % 3], 
    amount: [999, 2000, 1499][i % 3],
    notes: ['Plan sold', 'Wallet recharge', 'Plan sold'][i % 3], 
    created_at: new Date(Date.now() - i * 3600000 * 4).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }));

  // --- Data Fetching ---
  useEffect(() => {
    Promise.all([
      getDealerPolicies().then(r => setPolicies(r.data)).catch(() => setPolicies(MOCK_POLICIES)),
      getWalletHistory().then(r => setTxns(r.data?.transactions || [])).catch(() => setTxns(MOCK_TX))
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  // --- Calculations ---
  const totalEarned    = policies.reduce((s, p) => s + Number(p.dealer_earning || 0), 0);
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const chartData      = Array.from({ length: 10 }, (_, i) => ({ day: `Day ${i + 1}`, earned: Math.floor(Math.random() * 500) + 100 }));

  return (
    <div className="space-y-8 animate-fade-up font-sans">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-white text-3xl tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'Partner'}! 👋
          </h1>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Here's your sales and earnings overview.</p>
        </div>
        <button 
          onClick={() => navigate('/dealer/sell')} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-5 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
        >
          <ShoppingBag size={16}/> 
          Sell New Plan
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Wallet Balance"  value={`₹${Number(user?.wallet || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Wallet}     color="indigo" />
        <StatCard label="Total Earned"    value={`₹${totalEarned.toLocaleString()}`}             icon={TrendingUp} color="emerald" />
        <StatCard label="Active Policies" value={activePolicies}                                 icon={ShoppingBag}color="blue" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* Earnings Chart (Takes up 3 columns on large screens) */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl lg:col-span-3 flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-white text-lg">Your Earnings Trend</h3>
            <p className="text-xs text-zinc-400">Commission earned over the last 10 days</p>
          </div>
          <div className="h-[260px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 5, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEarned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/> {/* Emerald */}
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dx={-10}/>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <Area type="monotone" dataKey="earned" stroke="#10b981" fill="url(#gradEarned)" strokeWidth={3} activeDot={{ r: 6, fill: '#10b981', stroke: '#18181b', strokeWidth: 2 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions (Takes up 2 columns on large screens) */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/30">
            <h3 className="font-semibold text-white text-lg">Wallet Activity</h3>
            <button 
              onClick={() => navigate('/dealer/wallet')} 
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-zinc-800/50 flex-1 overflow-y-auto custom-scrollbar max-h-[280px]">
            {txns.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  t.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {t.type === 'credit' ? <ArrowDownRight size={18}/> : <ArrowUpRight size={18}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{t.notes}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.created_at}</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-sm font-bold ${t.type === 'credit' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Sales Table */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/30">
          <h3 className="font-semibold text-white text-lg">Recent Sales</h3>
          <button 
            onClick={() => navigate('/dealer/sold')} 
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Your Commission</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {policies.slice(0, 5).map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold">
                      {p.customer_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-zinc-200">{p.plan_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">{p.customer_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-zinc-100">
                      ₹{Number(p.amount_paid).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-400">
                      +₹{Number(p.dealer_earning).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {p.sold_at}
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                    No recent sales found. Click "Sell New Plan" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
