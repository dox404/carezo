import { useEffect, useState } from 'react';
import { getClaims, createClaim, getWarranties } from '../../api/index';
import { PageHeader, Spinner, Modal, FormField, EmptyState } from '../../components/UI';
import { ShieldAlert, Plus, Upload, Clock, CheckCircle2, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

const MOCK_CLAIMS = Array.from({ length: 5 }, (_, i) => ({
  claim_id: i + 1, 
  invoice_number: `CRZ-2024100${i}`,
  customer_name: `Customer ${i + 1}`, 
  contact_number: `9876${500000 + i}`,
  brand_name: ['Samsung', 'Apple', 'Dell'][i % 3], 
  model_name: ['Galaxy S23', 'iPhone 15', 'Inspiron'][i % 3],
  issue_description: ['Screen not working', 'Battery issue', 'Keyboard problem'][i % 3],
  claim_status: ['Pending', 'Approved', 'Closed'][i % 3],
  service_center: i > 0 ? 'ABC Service Center, Mumbai' : null,
  claim_date: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString()
}));

export default function DealerClaims() {
  // --- State ---
  const [claims, setClaims]             = useState([]);
  const [warranties, setWarranties]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);
  const [claimFile, setClaimFile]       = useState(null);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState({ warranty_id: '', customer_id: '', issue_description: '' });

  // --- Data Fetching ---
  const load = () => {
    getClaims()
      .then(r => setClaims(r.data))
      .catch(() => setClaims(MOCK_CLAIMS))
      .finally(() => setLoading(false));
    
    getWarranties()
      .then(r => setWarranties(r.data))
      .catch(() => {}); // Fallback handled silently if no warranties exist
  };
  
  useEffect(() => { load(); }, []);

  // --- Handlers ---
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.warranty_id || !form.issue_description) return toast.error('Please fill in all required fields');
    
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('warranty_id',       form.warranty_id);
      fd.append('customer_id',       form.customer_id);
      fd.append('issue_description', form.issue_description);
      if (claimFile) fd.append('claim_image', claimFile);
      
      await createClaim(fd);
      toast.success('Claim submitted successfully');
      setModalOpen(false);
      setForm({ warranty_id: '', customer_id: '', issue_description: '' });
      setClaimFile(null);
      load();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Failed to submit claim'); 
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
        title="Claims Dashboard" 
        subtitle={`Track and manage customer claims. You have ${claims.filter(c => c.claim_status === 'Pending').length} pending claims.`}
        action={
          <button 
            onClick={() => setModalOpen(true)} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm"
          >
            <Plus size={16}/> 
            File New Claim
          </button>
        } 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-6">
        {['Pending', 'Approved', 'Closed'].map(s => {
          const count = claims.filter(c => c.claim_status === s).length;
          
          return (
            <div key={s} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl px-6 py-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-400">{s} Claims</p>
                {s === 'Pending' && count > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                )}
              </div>
              <p className="text-3xl font-bold font-mono tracking-tight text-zinc-100">
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {claims.length === 0 ? (
          <EmptyState 
            icon={ShieldAlert} 
            title="No claims filed yet" 
            description="You haven't filed any warranty claims for your customers." 
            action={<button onClick={() => setModalOpen(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-6 py-2.5 transition-all">File a Claim</button>} 
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
                  <th className="px-6 py-4">Service Center</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date Filed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {claims.map(c => (
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
                      <p className="text-zinc-300 text-sm max-w-[200px] truncate" title={c.issue_description}>
                        {c.issue_description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-400">
                        {c.service_center || <span className="text-zinc-600">Pending Assignment</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(c.claim_status)}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-400 text-sm font-medium">
                      {c.claim_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Create Claim */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="File a Warranty Claim" size="md">
        <form onSubmit={onSubmit} className="space-y-5 mt-4">
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-2 flex gap-3">
            <ShieldAlert size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200/90 leading-relaxed">
              Ensure you select the correct invoice. Claims can only be filed for active warranties that have not expired.
            </p>
          </div>

          <FormField label="Select Warranty Invoice" error={!form.warranty_id && saving ? 'Required' : null}>
            <select 
              className={`${inputClass} appearance-none cursor-pointer`} 
              value={form.warranty_id}
              onChange={e => {
                const w = warranties.find(x => x.warranty_id == e.target.value);
                setForm({ ...form, warranty_id: e.target.value, customer_id: w?.customer_id || '' });
              }}
            >
              <option value="" disabled className="text-zinc-500">Select a valid warranty...</option>
              {warranties.map(w => (
                <option key={w.warranty_id} value={w.warranty_id}>
                  {w.invoice_number} — {w.customer_name} — {w.brand_name} {w.model_name}
                </option>
              ))}
            </select>
          </FormField>
          
          <FormField label="Describe the Issue" error={!form.issue_description && saving ? 'Required' : null}>
            <textarea 
              className={`${inputClass} resize-none`} 
              rows={4} 
              placeholder="Please provide a detailed description of the problem the customer is facing..."
              value={form.issue_description} 
              onChange={e => setForm({ ...form, issue_description: e.target.value })} 
            />
          </FormField>
          
          <div className="border-t border-zinc-800/50 pt-5 mt-2">
            <FormField label="Upload Evidence (Optional)">
              <label className="flex items-center gap-3 w-full bg-zinc-950 border border-zinc-800 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-indigo-500/20">
                  <Upload size={14} className="text-zinc-400 group-hover:text-indigo-400 transition-colors"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-300 truncate">{claimFile ? claimFile.name : 'Upload Photo of Issue'}</p>
                  <p className="text-xs text-zinc-500">Image file only</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setClaimFile(e.target.files[0])} />
              </label>
            </FormField>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-zinc-800 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>
      
    </div>
  );
}