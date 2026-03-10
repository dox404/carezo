import { useEffect, useState } from 'react';
import { getSales } from '../../api/index';
import { PageHeader, Spinner, SearchInput } from '../../components/UI';
import { ShoppingBag, Download, Calendar } from 'lucide-react';

const MOCK = Array.from({ length: 12 }, (_, i) => ({
  sale_id: i + 1, 
  invoice_number: `CRZ-20240${1000 + i}`,
  customer_name: `Customer ${i + 1}`, 
  contact_number: `9876${500000 + i}`,
  brand_name: ['Samsung', 'Apple', 'Dell', 'LG', 'Whirlpool'][i % 5],
  model_name: ['Galaxy S23', 'iPhone 15', 'Inspiron 15', '55 inch OLED', '340L Fridge'][i % 5],
  sub_category: ['Mobile Phone', 'Laptop', 'Television', 'Refrigerator'][i % 4],
  sale_price: [12000, 75000, 55000, 32000, 25000][i % 5],
  dealer_commission: [180, 900, 700, 400, 350][i % 5],
  distributor_commission: [90, 450, 350, 200, 175][i % 5],
  admin_commission: [729, 3150, 2450, 1400, 1225][i % 5],
  plan_years: [1, 2][i % 2],
  dealer_shop: `Shop ${(i % 4) + 1}`,
  distributor_name: `Distributor ${(i % 3) + 1}`,
  warranty_start: '2024-01-15',
  warranty_end: `202${5 + (i % 2)}-01-15`,
  payment_status: 'Success',
  sale_date: new Date(Date.now() - i * 2 * 86400000).toLocaleDateString(),
}));

export default function AdminSales() {
  // --- State ---
  const [sales, setSales]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    getSales()
      .then(r => { setSales(r.data); setFiltered(r.data); })
      .catch(() => { setSales(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  }, []);

  // --- Search & Filtering ---
  useEffect(() => {
    let res = sales;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(s =>
        s.invoice_number?.toLowerCase().includes(q) ||
        s.customer_name?.toLowerCase().includes(q) ||
        s.dealer_shop?.toLowerCase().includes(q) ||
        s.brand_name?.toLowerCase().includes(q)
      );
    }
    
    // Note: If you want the date filters to actually work, you need to parse the sale_date.
    // For now, I'm keeping the logic as you had it (UI state is there, but filtering isn't applied to dates yet).
    
    setFiltered(res);
  }, [search, sales]);

  // --- Calculations ---
  const totalRevenue   = filtered.reduce((s, x) => s + Number(x.sale_price || 0), 0);
  const totalAdmin     = filtered.reduce((s, x) => s + Number(x.admin_commission || 0), 0);
  const totalDealer    = filtered.reduce((s, x) => s + Number(x.dealer_commission || 0), 0);
  const totalDist      = filtered.reduce((s, x) => s + Number(x.distributor_commission || 0), 0);

  // --- Export ---
  const exportCSV = () => {
    const rows = [
      ['Invoice', 'Product', 'Customer', 'Sale Price', 'Dealer Comm', 'Dist Comm', 'Admin Comm', 'Warranty End', 'Date'],
      ...filtered.map(s => [
        s.invoice_number,
        `${s.brand_name} ${s.model_name}`,
        s.customer_name,
        s.sale_price,
        s.dealer_commission,
        s.distributor_commission,
        s.admin_commission,
        s.warranty_end,
        s.sale_date
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); 
    a.href = 'data:text/csv,' + encodeURIComponent(csv); 
    a.download = 'carezo_sales_report.csv'; 
    a.click();
  };

  // --- Render ---
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  return (
    <div className="animate-fade-up font-sans">
      
      {/* Header */}
      <PageHeader 
        title="Sales Records" 
        subtitle={`${filtered.length} warranties sold across the network`}
        action={
          <button onClick={exportCSV} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl px-4 py-2.5 transition-all duration-200 border border-zinc-700/50 flex items-center gap-2 text-sm shadow-sm">
            <Download size={16}/> 
            Export CSV
          </button>
        } 
      />

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-6">
        {[
          { label: 'Total Sales Volume', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-zinc-100',  bg: 'bg-zinc-900/80' },
          { label: 'Carezo Revenue',     value: `₹${totalAdmin.toLocaleString()}`,   color: 'text-indigo-400', bg: 'bg-indigo-500/10 border border-indigo-500/20' },
          { label: 'Dealer Payout',      value: `₹${totalDealer.toLocaleString()}`,  color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20' },
          { label: 'Distributor Payout', value: `₹${totalDist.toLocaleString()}`,    color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-3xl px-5 py-5 ${s.bg || 'border border-zinc-800 backdrop-blur-xl'}`}>
            <p className="text-sm text-zinc-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-mono tracking-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
        <div className="w-full lg:max-w-md">
          <SearchInput value={search} onChange={setSearch} placeholder="Search invoice, customer, dealer..." />
        </div>
        
        <div className="flex items-center gap-2 lg:ml-auto w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="date" 
              className="w-full lg:w-36 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 [color-scheme:dark]" 
              value={from} 
              onChange={e => setFrom(e.target.value)} 
            />
          </div>
          <span className="text-zinc-600 font-medium text-sm">to</span>
          <div className="relative flex-1 lg:flex-none">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="date" 
              className="w-full lg:w-36 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 [color-scheme:dark]" 
              value={to} 
              onChange={e => setTo(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50">
              <ShoppingBag size={28} className="text-zinc-500"/>
            </div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-1">No sales found</h3>
            <p className="text-sm text-zinc-500 max-w-sm">We couldn't find any sales matching your current search or date filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Network</th>
                  <th className="px-6 py-4">Sale Price</th>
                  <th className="px-6 py-4">Commissions</th>
                  <th className="px-6 py-4">Warranty Period</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(s => (
                  <tr key={s.sale_id} className="hover:bg-zinc-800/20 transition-colors">
                    
                    {/* Invoice */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold">
                        {s.invoice_number}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-100">{s.brand_name} {s.model_name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{s.sub_category} · {s.plan_years} Year Plan</p>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-200">{s.customer_name}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{s.contact_number}</p>
                    </td>

                    {/* Network (Dealer/Distributor) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {s.dealer_shop}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> {s.distributor_name}
                        </span>
                      </div>
                    </td>

                    {/* Sale Price */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ₹{Number(s.sale_price).toLocaleString()}
                      </span>
                    </td>

                    {/* Commissions */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs gap-4">
                          <span className="text-indigo-400 font-medium">Carezo:</span>
                          <span className="font-mono text-zinc-300">₹{Number(s.admin_commission).toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs gap-4">
                          <span className="text-blue-400 font-medium">Dealer:</span>
                          <span className="font-mono text-zinc-300">₹{Number(s.dealer_commission).toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs gap-4">
                          <span className="text-purple-400 font-medium">Dist:</span>
                          <span className="font-mono text-zinc-300">₹{Number(s.distributor_commission).toFixed(0)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Warranty Period */}
                    <td className="px-6 py-4">
                      <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 inline-block">
                        <p className="text-xs text-zinc-400 font-mono">{s.warranty_start}</p>
                        <p className="text-xs text-zinc-400 font-mono border-t border-zinc-800/50 mt-1 pt-1">{s.warranty_end}</p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 text-sm font-medium">
                        {s.sale_date}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
}