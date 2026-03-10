import { useEffect, useState } from 'react';
import { getReportSummary } from '../../api/index';
import { PageHeader, Spinner } from '../../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, IndianRupee, Users, ShoppingBag } from 'lucide-react';

// Theme Colors
const CHART_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']; // Indigo, Blue, Emerald, Amber, Purple
const GRID_COLOR = '#27272a'; // zinc-800
const TEXT_COLOR = '#a1a1aa'; // zinc-400

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

export default function AdminReports() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState('30');

  const MOCK = {
    today: { count: 14, total: 28000 },
    month: { count: 230, total: 460000 },
    totalDealers: 52, 
    activeDealers: 44,
    topDealers: [
      { name: 'Ramesh K', revenue: 56000, sales: 28 },
      { name: 'Priya S',  revenue: 44000, sales: 22 },
      { name: 'Amit S',   revenue: 38000, sales: 19 },
      { name: 'Deepa N',  revenue: 30000, sales: 15 },
      { name: 'Vijay P',  revenue: 22000, sales: 11 },
    ],
    categoryBreakdown: [
      { name: 'Electronics', value: 45 },
      { name: 'Appliances',  value: 30 },
      { name: 'Furniture',   value: 25 },
    ],
    earnings: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      carezo: Math.floor(Math.random() * 10000) + 4000,
      dealer: Math.floor(Math.random() * 6000) + 2000,
      gst:    Math.floor(Math.random() * 2000) + 800,
      sales:  Math.floor(Math.random() * 20) + 5,
    }))
  };

  useEffect(() => {
    setLoading(true);
    getReportSummary()
      .then(r => setData(r.data))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  const totalRevenue = data?.earnings?.reduce((s, e) => s + e.carezo + e.dealer + e.gst, 0) || 0;

  return (
    <div className="space-y-8 animate-fade-up font-sans">
      
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Reports & Analytics" 
          subtitle="Platform sales overview and earnings breakdown" 
        />
        <div className="flex p-1 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-xl w-fit shadow-lg">
          {['7', '14', '30'].map(r => (
            <button 
              key={r} 
              onClick={() => setRange(r)} 
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                range === r 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',  value: `₹${Number(totalRevenue).toLocaleString()}`,        icon: IndianRupee, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Monthly Sales',  value: data?.month?.count || 0,                            icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Active Dealers', value: `${data?.activeDealers}/${data?.totalDealers}`,     icon: Users,       color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: "Today's Revenue",value: `₹${Number(data?.today?.total || 0).toLocaleString()}`, icon: TrendingUp,  color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-inner ${color} ${bg}`}>
              <Icon size={20}/>
            </div>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{value}</p>
            <p className="text-zinc-400 text-sm mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Revenue Breakdown Bar Chart */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl lg:col-span-2">
          <div className="mb-6">
            <h3 className="font-semibold text-white text-lg">Revenue Breakdown</h3>
            <p className="text-sm text-zinc-400">Earnings distribution over the last {range} days</p>
          </div>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.earnings?.slice(-parseInt(range))} margin={{ left: -15, right: 5, bottom: 0, top: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: TEXT_COLOR }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: TEXT_COLOR }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: TEXT_COLOR, paddingTop: '20px' }} iconType="circle" />
                
                <Bar dataKey="carezo" name="Carezo" fill="#6366f1" radius={[0, 0, 0, 0]} stackId="a" /> {/* Indigo */}
                <Bar dataKey="dealer" name="Dealer" fill="#3b82f6" radius={[0, 0, 0, 0]} stackId="a" /> {/* Blue */}
                <Bar dataKey="gst"    name="GST"    fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" /> {/* Amber */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Categories Pie Chart */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="mb-2">
            <h3 className="font-semibold text-white text-lg">Categories</h3>
            <p className="text-sm text-zinc-400">Sales distribution by product category</p>
          </div>
          
          <div className="h-[200px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.categoryBreakdown} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={85} 
                  dataKey="value" 
                  paddingAngle={4}
                  stroke="none"
                >
                  {data?.categoryBreakdown?.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  formatter={(v) => `${v}%`} 
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '13px', color: '#f4f4f5', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3 mt-auto pt-4 border-t border-zinc-800/50">
            {data?.categoryBreakdown?.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}/>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">{c.name}</span>
                </div>
                <span className="text-sm font-bold text-zinc-100">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Dealers Table */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div>
            <h3 className="font-semibold text-white text-lg">Top Performing Dealers</h3>
            <p className="text-sm text-zinc-400">Ranked by revenue contribution this month</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Dealer Name</th>
                <th className="px-6 py-4">Sales Count</th>
                <th className="px-6 py-4">Revenue Gen.</th>
                <th className="px-6 py-4">Network Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {data?.topDealers?.map((d, i) => {
                const maxRev = Math.max(...data.topDealers.map(x => x.revenue));
                const pct = ((d.revenue / maxRev) * 100).toFixed(0);
                
                // Medals for top 3
                let rankStyle = "text-zinc-500 bg-zinc-800/50";
                if (i === 0) rankStyle = "text-amber-400 bg-amber-500/10 border border-amber-500/20"; // Gold
                if (i === 1) rankStyle = "text-zinc-300 bg-zinc-400/10 border border-zinc-400/20";   // Silver
                if (i === 2) rankStyle = "text-orange-400 bg-orange-500/10 border border-orange-500/20"; // Bronze

                return (
                  <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono text-sm font-bold ${rankStyle}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-100">{d.name}</td>
                    <td className="px-6 py-4 font-mono text-zinc-300">{d.sales}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">
                      ₹{Number(d.revenue).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 w-1/3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/50">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-zinc-400 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}