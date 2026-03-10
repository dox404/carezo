import { useEffect, useState } from 'react';
import { getDealers, createDealer, updateDealer } from '../../api/index';
import { PageHeader, Modal, Spinner, SearchInput, FormField, EmptyState } from '../../components/UI';
import { Users, Plus, Edit2, UserCheck, UserX, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

export default function DistributorDealers() {
  // --- State ---
  const [dealers, setDealers]         = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editData, setEditData]       = useState(null);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving]           = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // --- Mocks ---
  const MOCK = Array.from({ length: 6 }, (_, i) => ({
    dealer_id: i + 1, 
    shop_name: `Shop ${i + 1}`, 
    primary_contact_name: `Owner ${i + 1}`,
    contact_number: `9876${543210 + i}`, 
    email: `shop${i + 1}@example.com`,
    district: ['Mumbai', 'Delhi', 'Pune'][i % 3], 
    wallet_balance: (Math.random() * 5000).toFixed(2),
    dealer_commission_percent: 10, 
    status: i === 4 ? 0 : 1,
  }));

  // --- Data Fetching ---
  const load = () => {
    getDealers()
      .then(r => { setDealers(r.data); setFiltered(r.data); })
      .catch(() => { setDealers(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  // --- Search & Filtering ---
  useEffect(() => {
    let res = dealers;
    
    // Status Filter
    if (filterStatus === 'active') res = res.filter(d => d.status === 1);
    if (filterStatus === 'inactive') res = res.filter(d => d.status === 0);
    
    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(d => 
        d.shop_name?.toLowerCase().includes(q) || 
        d.contact_number?.includes(q) ||
        d.primary_contact_name?.toLowerCase().includes(q)
      );
    }
    
    setFiltered(res);
  }, [search, filterStatus, dealers]);

  // --- Handlers ---
  const openCreate = () => { setEditData(null); reset({}); setModalOpen(true); };
  const openEdit   = (d)  => { setEditData(d); reset(d); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editData) { 
        await updateDealer({ ...data, dealer_id: editData.dealer_id }); 
        toast.success('Dealer updated successfully'); 
      } else { 
        await createDealer(data); 
        toast.success('Dealer registered successfully'); 
      }
      setModalOpen(false); 
      load();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Operation failed'); 
    } finally {
      setSaving(false);
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
        title="My Network" 
        subtitle={`You are managing ${dealers.length} dealers in your network`}
        action={
          <button 
            onClick={openCreate} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm"
          >
            <Plus size={16}/> 
            Add Dealer
          </button>
        } 
      />

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 mt-6">
        <div className="w-full md:max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search dealers..." />
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button 
            onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
              filterStatus === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'active' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            {dealers.filter(d => d.status === 1).length} Active
          </button>
          
          <button 
            onClick={() => setFilterStatus(filterStatus === 'inactive' ? 'all' : 'inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
              filterStatus === 'inactive' 
                ? 'bg-zinc-800 text-zinc-300 border-zinc-600' 
                : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-400'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'inactive' ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
            {dealers.filter(d => d.status === 0).length} Inactive
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Store} 
            title="No dealers found" 
            description={search || filterStatus !== 'all' ? "Try adjusting your search query or filters." : "You haven't added any dealers to your network yet."} 
            action={!search && filterStatus === 'all' && <button onClick={openCreate} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-6 py-2.5 transition-all">Register Dealer</button>} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Shop Details</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Wallet Balance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map((d) => (
                  <tr key={d.dealer_id} className="hover:bg-zinc-800/20 transition-colors group">
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
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {d.district}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {d.dealer_commission_percent}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{Number(d.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {d.status === 1 ? (
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
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(d)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit Dealer">
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

      {/* Modal - Create/Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Dealer Details' : 'Register New Dealer'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Shop / Business Name" error={errors.shop_name?.message}>
              <input className={inputClass} placeholder="e.g. Kumar Electronics" {...register('shop_name', { required: 'Shop name is required' })} />
            </FormField>
            
            <FormField label="Owner Name" error={errors.primary_contact_name?.message}>
              <input className={inputClass} placeholder="e.g. Rajesh Kumar" {...register('primary_contact_name', { required: 'Owner name is required' })} />
            </FormField>
            
            <FormField label="Mobile Number" error={errors.contact_number?.message}>
              <input className={inputClass} placeholder="9876543210" {...register('contact_number', { required: 'Mobile number is required' })} />
            </FormField>
            
            <FormField label="Email Address">
              <input className={inputClass} type="email" placeholder="shop@email.com (Optional)" {...register('email')} />
            </FormField>
            
            {!editData && (
              <FormField label="Initial Password" error={errors.password?.message}>
                <input className={inputClass} type="password" placeholder="Set dealer login password" {...register('password', { required: 'Password is required' })} />
              </FormField>
            )}
            
            <FormField label="Commission Cut (%)">
              <input className={inputClass} type="number" step="0.01" placeholder="e.g. 10.5" {...register('dealer_commission_percent')} />
            </FormField>
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
      
    </div>
  );
}