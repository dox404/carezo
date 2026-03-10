import { useEffect, useState } from 'react';
import { getDealers, createDealer, updateDealer, deleteDealer, getDistributors } from '../../api/index';
import { PageHeader, Modal, Spinner, SearchInput, ConfirmDialog, FormField, EmptyState } from '../../components/UI';
import { Users, Plus, Edit2, Trash2, UserCheck, UserX, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

export default function AdminDealers() {
  // --- State ---
  const [dealers, setDealers]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editData, setEditData]         = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [search, setSearch]             = useState('');
  const [saving, setSaving]             = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // --- Mock Data Fallback ---
  const MOCK_DEALERS = Array.from({ length: 8 }, (_, i) => ({
    dealer_id: i + 1, 
    shop_name: `Shop ${i + 1}`, 
    primary_contact_name: `Owner ${i + 1}`,
    contact_number: `9876${543210 + i}`, 
    email: `shop${i + 1}@example.com`,
    distributor_name: `Distributor ${(i % 3) + 1}`, 
    district: ['Mumbai', 'Delhi', 'Bangalore'][i % 3],
    dealer_commission_percent: 10, 
    distributor_commission_percent: 5,
    wallet_balance: (Math.random() * 5000).toFixed(2), 
    status: i === 4 ? 0 : 1,
    created_at: new Date().toLocaleDateString()
  }));

  // --- Data Fetching ---
  const load = async () => {
    Promise.all([
      getDealers()
        .then(r => { setDealers(r.data); setFiltered(r.data); })
        .catch(() => { setDealers(MOCK_DEALERS); setFiltered(MOCK_DEALERS); }),
      getDistributors()
        .then(r => setDistributors(r.data))
        .catch(() => setDistributors([{ distributor_id: 1, distributor_name: 'Sample Distributor' }]))
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(dealers.filter(d => 
      d.shop_name?.toLowerCase().includes(q) || 
      d.contact_number?.includes(q) || 
      d.primary_contact_name?.toLowerCase().includes(q)
    ));
  }, [search, dealers]);

  // --- Handlers ---
  const openCreate = () => { setEditData(null); reset({}); setModalOpen(true); };
  const openEdit   = (d)  => { setEditData(d);  reset(d);  setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editData) { 
        await updateDealer({ ...data, dealer_id: editData.dealer_id }); 
        toast.success('Dealer updated successfully'); 
      } else { 
        await createDealer(data); 
        toast.success('Dealer created successfully'); 
      }
      setModalOpen(false); 
      load();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Operation failed'); 
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    try { 
      await deleteDealer(deleteId); 
      toast.success('Dealer deleted'); 
      load(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Delete failed'); 
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
        title="Dealers" 
        subtitle={`${dealers.length} active dealers registered across the network`}
        action={
          <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm">
            <Plus size={16}/> 
            Add Dealer
          </button>
        } 
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 mt-6">
        <div className="w-full sm:max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search dealers..." />
        </div>
        <div className="flex gap-3 sm:ml-auto">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {dealers.filter(d => d.status).length} Active
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            {dealers.filter(d => !d.status).length} Inactive
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No dealers found" 
            description={search ? "Try adjusting your search query." : "Add your first dealer to the network."} 
            action={!search && <button onClick={openCreate} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-6 py-2.5 transition-all">Add Dealer</button>} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Shop Details</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Distributor</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Wallet</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map((d, i) => (
                  <tr key={d.dealer_id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                      {(i + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-sm shadow-inner">
                          {d.shop_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-100">{d.shop_name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{d.primary_contact_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-200 font-mono text-xs">{d.contact_number}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{d.email || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-xs font-medium text-zinc-300">
                        {d.distributor_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-zinc-300">Dealer: <span className="font-mono text-indigo-400">{d.dealer_commission_percent}%</span></p>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5">Dist: <span className="font-mono text-zinc-400">{d.distributor_commission_percent}%</span></p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 w-fit border border-emerald-500/20">
                        <Wallet size={14} className="text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-semibold text-xs">₹{Number(d.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {d.status ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          <UserCheck size={12}/> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium">
                          <UserX size={12}/> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(d)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => setDeleteId(d.dealer_id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Delete">
                          <Trash2 size={16}/>
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

      {/* Modal - Create/Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Dealer Details' : 'Register New Dealer'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          
          {/* Assignment Section */}
          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 mb-4">
            <FormField label="Assign to Distributor" error={errors.distributor_id?.message}>
              <select className={`${inputClass} appearance-none cursor-pointer`} {...register('distributor_id', { required: 'Please select a distributor' })}>
                <option value="" disabled className="text-zinc-500">Select parent distributor...</option>
                {distributors.map(d => (
                  <option key={d.distributor_id} value={d.distributor_id}>
                    {d.distributor_name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Shop / Business Name" error={errors.shop_name?.message}>
              <input className={inputClass} placeholder="Kumar Electronics" {...register('shop_name', { required: 'Shop name is required' })} />
            </FormField>
            
            <FormField label="Owner Name" error={errors.primary_contact_name?.message}>
              <input className={inputClass} placeholder="Rajesh Kumar" {...register('primary_contact_name', { required: 'Owner name is required' })} />
            </FormField>
            
            <FormField label="Mobile Number" error={errors.contact_number?.message}>
              <input className={inputClass} placeholder="9876543210" {...register('contact_number', { required: 'Mobile number is required' })} />
            </FormField>
            
            <FormField label="Email Address">
              <input className={inputClass} type="email" placeholder="shop@email.com (Optional)" {...register('email')} />
            </FormField>
            
            {!editData && (
              <FormField label="Login Password" error={errors.password?.message}>
                <input className={inputClass} type="password" placeholder="Set initial password" {...register('password', { required: 'Password is required' })} />
              </FormField>
            )}
            
            <FormField label="GST Number">
              <input className={inputClass} placeholder="27AABCU9603R1ZX (Optional)" {...register('gst_number')} />
            </FormField>
          </div>

          <div className="border-t border-zinc-800/50 pt-5 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Dealer Commission (%)">
                <input className={inputClass} type="number" step="0.01" placeholder="e.g. 10.5" {...register('dealer_commission_percent')} />
              </FormField>
              
              <FormField label="Distributor Commission (%)">
                <input className={inputClass} type="number" step="0.01" placeholder="e.g. 5.0" {...register('distributor_commission_percent')} />
              </FormField>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 pt-5 mt-2">
            <FormField label="Full Address">
              <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Building, Street, Area..." {...register('address')} />
            </FormField>
          </div>

          {editData && (
            <div className="border-t border-zinc-800/50 pt-5 mt-2">
              <FormField label="Account Status">
                <select className={`${inputClass} appearance-none cursor-pointer`} {...register('status')}>
                  <option value={1}>Active - Can log in and operate</option>
                  <option value={0}>Inactive - Access disabled</option>
                </select>
              </FormField>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-zinc-800 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editData ? 'Update Dealer' : 'Register Dealer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={onDelete}
        title="Delete Dealer" 
        message="Are you sure you want to delete this dealer? This will permanently remove their access and delete their data from the platform." 
        danger 
      />
      
    </div>
  );
}