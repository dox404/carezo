import { useEffect, useState } from 'react';
import { getSales } from '../../api/index';
import { PageHeader, Spinner, SearchInput, EmptyState } from '../../components/UI';
import { ClipboardList, Download, ShoppingBag, ShieldCheck, Wallet } from 'lucide-react';

const MOCK = Array.from({ length: 10 }, (_, i) => ({
  sale_id: i + 1, 
  invoice_number: `CRZ-2024${1000 + i}`,
  customer_name: `Customer ${i + 1}`, 
  contact_number: `9876${500000 + i}`,
  brand_name: ['Samsung', 'Apple', 'Dell', 'LG'][i % 4],
  model_name: ['Galaxy S23', 'iPhone 15', 'Inspiron 15', '55 inch OLED'][i % 4],
  sub_category: ['Mobile Phone', 'Laptop', 'Television'][i % 3],
  sale_price: [12000, 45000, 65000, 30000][i % 4],
  dealer_commission: [200, 600, 900, 500][i % 4],
  plan_years: [1, 2][i % 2],
  warranty_start: '2024-01-01', 
  warranty_end: ['2025-01-01', '2026-01-01'][i % 2],
  payment_status: 'Success',
  created_at: new Date(Date.now() - i * 86400000).toLocaleDateString()
}));

export default function SoldPlans() {
  // --- State ---
  const [sales, setSales]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    getSales()
      .then(r => { setSales(r.data); setFiltered(r.data); })
      .catch(() => { setSales(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  }, []);

  // --- Search Filtering ---
  useEffect(() => {
    let res = sales;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(s =>
        s.invoice_number?.toLowerCase().includes(q) ||
        s.customer_name?.toLowerCase().includes(q) ||
        s.brand_name?.toLowerCase().includes(q) ||
        s.model_name?.toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, sales]);

  // --- Calculations ---
  const totalCommission = sales.reduce((sum, s) => sum + Number(s.dealer_commission || 0), 0);
  const activeWarranties = sales.filter(s => s.payment_status === 'Success').length;

  // --- Export Functionality ---
  const exportCSV = () => {
    const rows = [
      ['Invoice', 'Product Details', 'Customer Name', 'Contact', 'Sale Price', 'My Commission', 'Warranty Start', 'Warranty End', 'Date Sold'],
      ...filtered.map(s => [
        s.invoice_number,
        `${s.brand_name} ${s.model_name} (${s.sub_category})`,
        s.customer_name,
        s.contact_number,
        s.sale_price,
        s.dealer_commission,
        s.warranty_start,
        s.warranty_end,
        s.created_at
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); 
    a.href = 'data:text/csv,' + encodeURIComponent(csv); 
    a.download = 'my_carezo_sales.csv'; 
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
        title="My Sales" 
        subtitle={`You have recorded ${sales.length} total sales`}
        action={
          <button 
            onClick={exportCSV} 
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl px-4 py-2.5 transition-all duration-200 border border-zinc-700/50 flex items-center gap-2 text-sm shadow-sm"
          >
            <Download size={16}/> 
            Export CSV
          </button>
        } 
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 mt-6">
        {[
          { label: 'Total Sales Recorded', value: sales.length,                        icon: ShoppingBag, color: 'text-zinc-100',   bg: 'bg-zinc-900/80 border-zinc-800' },
          { label: 'Active Warranties',    value: activeWarranties,                    icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Total Commission',     value: `₹${totalCommission.toLocaleString()}`, icon: Wallet,      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((s, i) => (
          <div key={s.label} className={`rounded-3xl p-6 border backdrop-blur-xl shadow-lg flex items-center gap-4 ${s.bg}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
              i === 0 ? 'bg-zinc-800 text-zinc-400' : 
              i === 1 ? 'bg-indigo-500/20 text-indigo-400' : 
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium mb-0.5">{s.label}</p>
              <p className={`text-2xl font-bold font-mono tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice, customer, or product..." />
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={ClipboardList} 
            title="No sales found" 
            description={search ? "Try adjusting your search criteria." : "You haven't recorded any sales yet."} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product Price</th>
                  <th className="px-6 py-4">Your Commission</th>
                  <th className="px-6 py-4">Warranty Period</th>
                  <th className="px-6 py-4 text-right">Date Sold</th>
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

                    {/* Sale Price */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-zinc-300">₹{Number(s.sale_price).toLocaleString()}</span>
                    </td>

                    {/* Commission */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400">
                        +₹{Number(s.dealer_commission).toLocaleString()}
                      </span>
                    </td>

                    {/* Warranty Box */}
                    <td className="px-6 py-4">
                      <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 inline-block">
                        <p className="text-xs text-zinc-400 font-mono">{s.warranty_start}</p>
                        <p className="text-xs text-zinc-400 font-mono border-t border-zinc-800/50 mt-1 pt-1">{s.warranty_end}</p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-zinc-400 text-sm font-medium">
                        {s.created_at}
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