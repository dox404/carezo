import { useEffect, useState } from 'react';
import { getClaims, updateClaim } from '../../api/index';
import { PageHeader, Spinner, SearchInput, Modal, FormField, EmptyState } from '../../components/UI';
import { AlertCircle, Edit2, Clock, CheckCircle2, Archive, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

const MOCK = Array.from({ length: 8 }, (_, i) => ({
  claim_id: i + 1, 
  invoice_number: `CRZ-20241${i + 1}0${i}`,
  customer_name: `Customer ${i + 1}`, 
  contact_number: `9876${500000 + i}`,
  brand_name: ['Samsung', 'Apple', 'Dell', 'LG'][i % 4],
  model_name: ['Galaxy S23', 'iPhone 15', 'Inspiron 15', 'OLED TV'][i % 4],
  issue_description: ['Screen cracked', 'Battery drains fast', 'Keyboard not working', 'Display issue'][i % 4],
  claim_status: ['Pending', 'Pending', 'Approved', 'Closed'][i % 4],
  service_center: i > 1 ? 'Tech Care, Mumbai' : null,
  dealer_shop: `Shop ${(i % 3) + 1}`,
  claim_date: new Date(Date.now() - i * 3 * 86400000).toLocaleDateString(),
}));

export default function AdminClaims() {
  // --- State ---
  const [claims, setClaims]             = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editClaim, setEditClaim]       = useState(null);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState({ claim_status: '', service_center: '', resolution_notes: '' });

  // --- Data Fetching ---
  const load = () => {
    getClaims()
      .then(r => { setClaims(r.data); setFiltered(r.data); })
      .catch(() => { setClaims(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  // --- Search & Filtering ---
  useEffect(() => {
    let res = claims;
    if (filterStatus !== 'all') {
      res = res.filter(c => c.claim_status === filterStatus);
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(c => 
        c.customer_name?.toLowerCase().includes(q) || 
        c.invoice_number?.toLowerCase().includes(q) ||
        c.brand_name?.toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, filterStatus, claims]);

  // --- Handlers ---
  const openEdit = (c) => {
    setEditClaim(c);
    setForm({ 
      claim_status: c.claim_status, 
      service_center: c.service_center || '', 
      resolution_notes: c.resolution_notes || '' 
    });
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateClaim({ claim_id: editClaim.claim_id, ...form });
      toast.success('Claim updated successfully');
      setEditClaim(null);
      load();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Update failed'); 
    } finally {
      setSaving(false);
    }
  };

  // --- Helper for Status Badges ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium"><Clock size={12}/> Pending</span>;
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"><CheckCircle2 size={12}/> Approved</span>;
      case 'Closed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium"><Archive size={12}/> Closed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium">{status}</span>;
    }
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
        title="Claims Management" 
        subtitle={`${claims.filter(c => c.claim_status === 'Pending').length} pending claims require attention`} 
      />

      {/* Status Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-6">
        {['Pending', 'Approved', 'Closed'].map(s => {
          const count = claims.filter(c => c.claim_status === s).length;
          const isActive = filterStatus === s;
          
          return (
            <button 
              key={s} 
              onClick={() => setFilterStatus(isActive ? 'all' : s)}
              className={`text-left rounded-3xl px-6 py-5 transition-all duration-200 border ${
                isActive 
                  ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                  : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 backdrop-blur-xl'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${isActive ? 'text-indigo-300' : 'text-zinc-400'}`}>{s} Claims</p>
                {s === 'Pending' && count > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                )}
              </div>
              <p className={`text-3xl font-bold font-mono tracking-tight ${isActive ? 'text-indigo-400' : 'text-zinc-100'}`}>
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-6 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by customer, invoice, or brand..." />
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={ShieldAlert} 
            title="No claims found" 
            description={search || filterStatus !== 'all' ? "Try adjusting your search or status filters." : "There are currently no warranty claims filed."} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Reported Issue</th>
                  <th className="px-6 py-4">Network Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(c => (
                  <tr key={c.claim_id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold">
                        {c.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-100">{c.brand_name} {c.model_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-200">{c.customer_name}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{c.contact_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 text-sm max-w-[180px] truncate" title={c.issue_description}>
                        {c.issue_description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-zinc-300">D: {c.dealer_shop}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">SC: {c.service_center || 'Not assigned'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(c.claim_status)}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm font-medium">
                      {c.claim_date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all" title="Update Claim">
                          <Edit2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Edit Claim */}
      <Modal open={!!editClaim} onClose={() => setEditClaim(null)} title="Update Warranty Claim" size="md">
        {editClaim && (
          <form onSubmit={onUpdate} className="space-y-5 mt-4">
            
            {/* Claim Context Card */}
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-5 mb-2">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-zinc-500 font-mono mb-1">{editClaim.invoice_number}</p>
                  <p className="text-base font-semibold text-zinc-100">{editClaim.brand_name} {editClaim.model_name}</p>
                </div>
                {getStatusBadge(editClaim.claim_status)}
              </div>
              
              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 mt-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Reported Issue</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{editClaim.issue_description}</p>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800/50">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Customer</p>
                  <p className="text-sm font-medium text-zinc-200">{editClaim.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Contact</p>
                  <p className="text-sm font-medium font-mono text-zinc-200">{editClaim.contact_number}</p>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <FormField label="Update Status">
                <select 
                  className={`${inputClass} appearance-none cursor-pointer`} 
                  value={form.claim_status} 
                  onChange={e => setForm({...form, claim_status: e.target.value})}
                >
                  <option value="Pending">Pending Evaluation</option>
                  <option value="Approved">Approved for Repair/Replacement</option>
                  <option value="Closed">Claim Closed / Resolved</option>
                </select>
              </FormField>
              
              <FormField label="Assigned Service Center">
                <input 
                  className={inputClass} 
                  placeholder="e.g. ABC Service Center, City (Optional)" 
                  value={form.service_center} 
                  onChange={e => setForm({...form, service_center: e.target.value})} 
                />
              </FormField>
              
              <FormField label="Resolution Notes / Updates">
                <textarea 
                  className={`${inputClass} resize-none`} 
                  rows={3} 
                  placeholder="Add internal notes about the resolution or next steps..." 
                  value={form.resolution_notes} 
                  onChange={e => setForm({...form, resolution_notes: e.target.value})} 
                />
              </FormField>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-zinc-800 mt-2">
              <button type="button" onClick={() => setEditClaim(null)} className="flex-1 px-4 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Update Claim'}
              </button>
            </div>
          </form>
        )}
      </Modal>
      
    </div>
  );
}