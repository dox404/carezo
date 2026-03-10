import { useEffect, useState } from 'react';
import { getReportSummary } from '../../api/index';
import { StatCard, Spinner } from '../../components/UI';
import { Users, Package, TrendingUp, IndianRupee, ShoppingBag, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-zinc-400 font-medium mb-2 border-b border-zinc-800/50 pb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <p className="text-zinc-200">
              <span className="text-zinc-400">{p.name}:</span> <span className="font-mono font-medium">₹{Number(p.value).toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
  return null;
};

export default function AdminDashboard() {
  // --- State ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // --- Data Fetching ---
  useEffect(() => {
    getReportSummary()
      .then(r => setData(r.data))
      .catch(() => {
        // Mock data for development
        setData({
          today: { count: 12, total: 24500 },
          month: { count: 187, total: 384000 },
          totalDealers: 45,
          activeDealers: 38,
          topDealers: [
            { name: 'Ramesh Kumar', sales: 28, revenue: 56000 },
            { name: 'Priya Sharma', sales: 22, revenue: 44000 },
            { name: 'Amit Singh',   sales: 19, revenue: 38000 },
            { name: 'Deepa Nair',   sales: 15, revenue: 30000 },
            { name: 'Vijay Patel',  sales: 11, revenue: 22000 },
          ],
          earnings: Array.from({ length: 14 }, (_, i) => ({
            date: `Day ${i + 1}`,
            carezo: Math.floor(Math.random() * 8000) + 3000,
            dealer: Math.floor(Math.random() * 5000) + 2000,
            gst:    Math.floor(Math.random() * 1500) + 500,
          }))
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  // --- Chart Theming Variables ---
  const colors = {
    carezo: '#4f46e5', // indigo-600
    dealer: '#3b82f6', // blue-500
    gst: '#eab308',    // yellow-500
    grid: '#27272a',   // zinc-800
    text: '#a1a1aa'    // zinc-400
  };

  return (
    <div className="space-y-8 animate-fade-up font-sans">
      
      {/* Header */}
      <div>
        <h1 className="font-bold text-white text-3xl tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1 font-medium">Platform overview and analytics</p>
      </div>

      {/* Stats - Note: Ensure your StatCard component handles these colors gracefully */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales"   value={data?.today?.count || 0}       icon={ShoppingBag}    color="indigo" />
        <StatCard label="Today's Revenue" value={`₹${Number(data?.today?.total || 0).toLocaleString()}`} icon={IndianRupee} color="blue" />
        <StatCard label="Monthly Revenue" value={`₹${Number(data?.month?.total || 0).toLocaleString()}`} icon={TrendingUp}  color="emerald" />
        <StatCard label="Total Dealers"   value={`${data?.activeDealers || 0}/${data?.totalDealers || 0}`} icon={Users} color="purple" sub="Active / Total" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Revenue Trend */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 lg:col-span-2 shadow-xl">
          <div className="mb-6">
            <h3 className="font-semibold text-white text-lg">Revenue Trend</h3>
            <p className="text-zinc-400 text-sm">Last 14 days earnings breakdown</p>
          </div>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.earnings} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCarezo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={colors.carezo} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={colors.carezo} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradDealer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={colors.dealer} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={colors.dealer} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: colors.text }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: colors.text }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.grid, strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="carezo" name="Carezo"  stroke={colors.carezo} fill="url(#gradCarezo)" strokeWidth={3} activeDot={{ r: 6, fill: colors.carezo, stroke: '#18181b', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="dealer" name="Dealer"  stroke={colors.dealer} fill="url(#gradDealer)" strokeWidth={3} activeDot={{ r: 6, fill: colors.dealer, stroke: '#18181b', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="flex gap-6 mt-6 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"/>
              <span className="text-sm font-medium text-zinc-300">Carezo Earnings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"/>
              <span className="text-sm font-medium text-zinc-300">Dealer Commission</span>
            </div>
          </div>
        </div>

        {/* List: Top Dealers */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-white text-lg">Top Dealers</h3>
            <p className="text-zinc-400 text-sm">By revenue this month</p>
          </div>
          
          <div className="space-y-4 flex-1">
            {data?.topDealers?.map((d, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shadow-inner">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{d.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{d.sales} sales completed</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-mono font-bold text-indigo-400">
                    ₹{Number(d.revenue).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart: GST Collected */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="font-semibold text-white text-lg">GST Collected</h3>
          <p className="text-zinc-400 text-sm">Daily tax breakdown</p>
        </div>
        
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.earnings} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: colors.text }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: colors.text }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
              <Bar dataKey="gst" name="GST" fill={colors.gst} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}