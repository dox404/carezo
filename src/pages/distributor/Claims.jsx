import { useEffect, useState } from 'react';
import { getClaims, updateClaim } from '../../api/index';
import { PageHeader, Spinner, SearchInput, Modal, FormField, EmptyState } from '../../components/UI';
import { AlertCircle, Edit2, Clock, CheckCircle2, Archive, MessageSquare, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Pending:  { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  Approved: { color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: CheckCircle2 },
  Closed:   { color: 'text-zinc-500', bg: 'bg-zinc-800/50 border-zinc-700/50', icon: Archive },
};

const MOCK = Array.from({ length: 6 }, (_, i) => ({
  claim_id: i + 1, 
  invoice_number: `CRZ-20241${i + 1}00`,
  customer_name: `Customer ${i + 1}`, 
  brand_name: ['Samsung', 'Apple'][i % 2], 
  model_name: ['Galaxy S23', 'iPhone 15'][i % 2],
  issue_description: ['Screen flickering issues', 'Battery draining rapidly'][i % 2],
  claim_status: ['Pending', 'Approved', 'Closed'][i % 3],
  dealer_shop: `Shop ${(i % 3) + 1}`,
  service_center: i > 1 ? 'Tech Care Center' : null,
  claim_date: new Date(Date.now() - i * 2 * 86400000).toLocaleDateString('en-IN')
}));

const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

export default function DistributorClaims() {
  const [claims, setClaims]       = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [editClaim, setEditClaim] = useState(null);
  const [form, setForm]           = useState({ claim_status: '', service_center: '', resolution_notes: '' });
  const [saving, setSaving]       = useState(false);

  const load = () => {
    getClaims()
      .then(r => { setClaims(r.data); setFiltered(r.data); })
      .catch(() => { setClaims(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(claims.filter(c => 
      c.customer_name?.toLowerCase().includes(q) || 
      c.invoice_number?.toLowerCase().includes(q) ||
      c.dealer_shop?.toLowerCase().includes(q)
    ));
  }, [search, claims]);

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
      toast.error(err.response?.data?.error || 'Failed to update claim'); 
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="animate-fade-up font-sans">
      <PageHeader 
        title="Claims Management" 
        subtitle={`${claims.filter(c => c.claim_status === 'Pending').length} claims requiring your attention`} 
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-6">
        {['Pending', 'Approved', 'Closed'].map(s => {
          const config = STATUS_CONFIG[s];
          const Icon = config.icon;
          return (
            <div key={s} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${config.bg} ${config.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-mono tracking-tight">
                  {claims.filter(c => c.claim_status === s).length}
                </p>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{s} Claims</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice or customer..." />
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={AlertCircle} title="No claims found" description="There are no claims matching your current search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Product / Issue</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Dealer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Claim Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(c => {
                  const config = STATUS_CONFIG[c.claim_status] || STATUS_CONFIG.Pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={c.claim_id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md font-semibold">
                          {c.invoice_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-zinc-100 text-sm font-semibold">{c.brand_name} {c.model_name}</p>
                        <p className="text-xs text-zinc-500 mt-1 italic truncate max-w-[180px]">"{c.issue_description}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-zinc-200 text-sm font-medium">{c.customer_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded border border-zinc-700/50">
                          {c.dealer_shop}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.color}`}>
                          <StatusIcon size={12}/> {c.claim_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs font-mono">
                        {c.claim_date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEdit(c)} 
                          className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                        >
                          <Edit2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Claim Modal */}
      <Modal open={!!editClaim} onClose={() => setEditClaim(null)} title="Update Claim Status">
        {editClaim && (
          <form onSubmit={onUpdate} className="space-y-5 mt-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl mb-2">
               <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Issue Reported</p>
               <p className="text-sm text-zinc-200 leading-relaxed">{editClaim.issue_description}</p>
            </div>

            <FormField label="Current Status">
              <div className="relative">
                <select className={`${inputClass} appearance-none`} value={form.claim_status} onChange={e => setForm({...form, claim_status: e.target.value})}>
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approve for Service</option>
                  <option value="Closed">Close Claim</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <Clock size={16} />
                </div>
              </div>
            </FormField>

            <FormField label="Assigned Service Center">
              <div className="relative">
                <input 
                  className={inputClass} 
                  placeholder="Enter service center name..." 
                  value={form.service_center} 
                  onChange={e => setForm({...form, service_center: e.target.value})} 
                />
                <Wrench size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            </FormField>

            <FormField label="Resolution / Internal Notes">
              <div className="relative">
                <textarea 
                  className={`${inputClass} resize-none`} 
                  rows={3} 
                  placeholder="Provide details on the fix or reason for rejection..."
                  value={form.resolution_notes} 
                  onChange={e => setForm({...form, resolution_notes: e.target.value})} 
                />
                <MessageSquare size={16} className="absolute right-4 top-4 text-zinc-500" />
              </div>
            </FormField>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <button type="button" onClick={() => setEditClaim(null)} className="flex-1 px-4 py-3 rounded-xl font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}