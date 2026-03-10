import { useEffect, useState } from 'react';
import { getWarranties } from '../../api/index';
import { PageHeader, Spinner, SearchInput, EmptyState } from '../../components/UI';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, Shield } from 'lucide-react';

const MOCK = Array.from({ length: 8 }, (_, i) => ({
  warranty_id: i + 1, 
  invoice_number: `CRZ-2024${1000 + i}`,
  customer_name: `Customer ${i + 1}`, 
  contact_number: `9876${500000 + i}`,
  brand_name: ['Samsung', 'Apple', 'Dell', 'LG'][i % 4],
  model_name: ['Galaxy S23', 'iPhone 15', 'Inspiron 15', 'OLED TV'][i % 4],
  category: 'Electronics', 
  plan_years: [1, 2][i % 2],
  warranty_start: '2024-01-15',
  warranty_end: i < 2 ? '2024-12-31' : `202${5 + (i % 2)}-01-15`,
  payment_status: 'Success',
  claim_count: i % 4 === 0 ? 1 : 0,
}));

export default function DealerWarranty() {
  // --- State ---
  const [warranties, setWarranties] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');

  // --- Data Fetching ---
  useEffect(() => {
    getWarranties()
      .then(r => { setWarranties(r.data); setFiltered(r.data); })
      .catch(() => { setWarranties(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const in30  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    
    let res = warranties;
    
    if (filter === 'active')   res = res.filter(w => w.warranty_end >= today);
    if (filter === 'expired')  res = res.filter(w => w.warranty_end < today);
    if (filter === 'expiring') res = res.filter(w => w.warranty_end >= today && w.warranty_end <= in30);
    
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(w => 
        w.invoice_number?.toLowerCase().includes(q) || 
        w.customer_name?.toLowerCase().includes(q) ||
        w.brand_name?.toLowerCase().includes(q) ||
        w.contact_number?.includes(q)
      );
    }
    setFiltered(res);
  }, [search, filter, warranties]);

  // --- Helpers ---
  const today = new Date().toISOString().split('T')[0];
  const in30  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const getStatus = (end) => {
    if (end < today) return { label: 'Expired',       cls: 'bg-zinc-800 text-zinc-400 border-zinc-700', icon: XCircle };
    if (end <= in30) return { label: 'Expiring Soon', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: ShieldAlert };
    return                  { label: 'Active',        cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ShieldCheck };
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
        title="Warranty Tracker" 
        subtitle="Manage and track active, expiring, and past warranties for your customers" 
      />

      {/* Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-6">
        {[
          { label: 'Total Warranties', value: warranties.length,                                                         key: 'all',      color: 'text-zinc-100',   bgActive: 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/50' },
          { label: 'Active',           value: warranties.filter(w => w.warranty_end >= today).length,                    key: 'active',   color: 'text-emerald-400',bgActive: 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/50' },
          { label: 'Expiring (30d)',   value: warranties.filter(w => w.warranty_end >= today && w.warranty_end <= in30).length, key: 'expiring', color: 'text-amber-400',  bgActive: 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/50' },
          { label: 'Expired',          value: warranties.filter(w => w.warranty_end < today).length,                     key: 'expired',  color: 'text-zinc-400',   bgActive: 'bg-zinc-800/80 border-zinc-500/30 ring-1 ring-zinc-500/50' },
        ].map(s => {
          const isActive = filter === s.key;
          return (
            <button 
              key={s.key} 
              onClick={() => setFilter(s.key)}
              className={`text-left rounded-3xl px-5 py-4 transition-all duration-200 border ${
                isActive 
                  ? `${s.bgActive} shadow-lg` 
                  : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 backdrop-blur-xl'
              }`}
            >
              <p className={`text-sm font-medium mb-1 ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`}>
                {s.label}
              </p>
              <p className={`text-2xl font-bold font-mono tracking-tight ${isActive ? s.color : 'text-zinc-100'}`}>
                {s.value}
              </p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-6 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice, customer, or product..." />
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Shield} 
            title="No warranties found" 
            description={search || filter !== 'all' ? "Try adjusting your search query or filter selection." : "You haven't recorded any warranties yet."} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Warranty Period</th>
                  <th className="px-6 py-4">Claims History</th>
                  <th className="px-6 py-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(w => {
                  const status = getStatus(w.warranty_end);
                  return (
                    <tr key={w.warranty_id} className="hover:bg-zinc-800/20 transition-colors group">
                      
                      {/* Invoice */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold">
                          {w.invoice_number}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-zinc-100">{w.brand_name} {w.model_name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{w.category} · {w.plan_years} Year Plan</p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-200">{w.customer_name}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{w.contact_number}</p>
                      </td>

                      {/* Warranty Period */}
                      <td className="px-6 py-4">
                        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 inline-block">
                          <div className="flex items-center gap-2 mb-1 border-b border-zinc-800/50 pb-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Start</span>
                            <span className="text-xs text-zinc-300 font-mono">{w.warranty_start}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">End</span>
                            <span className={`text-xs font-mono font-medium ${status.label === 'Expired' ? 'text-zinc-500 line-through' : status.label === 'Expiring Soon' ? 'text-amber-400' : 'text-zinc-200'}`}>
                              {w.warranty_end}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Claims History */}
                      <td className="px-6 py-4">
                        {w.claim_count > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                            <AlertTriangle size={12}/>
                            {w.claim_count} Claim{w.claim_count > 1 ? 's' : ''} Filed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800/50 text-zinc-500 border border-zinc-800 text-xs font-medium">
                            No Claims
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${status.cls}`}>
                          <status.icon size={12}/> 
                          {status.label}
                        </span>
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
}