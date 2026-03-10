import { useEffect, useState } from 'react';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../api/index';
import { PageHeader, Modal, Spinner, SearchInput, ConfirmDialog, FormField, EmptyState } from '../../components/UI';
import { Package, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

const CATEGORIES = ['Electronics', 'Appliances', 'Furniture', 'Automobile', 'Other'];
const SUB_CATEGORIES = {
  Electronics: ['Mobile Phone', 'Laptop', 'Television', 'Tablet', 'Camera', 'Smartwatch'],
  Appliances:  ['Refrigerator', 'Washing Machine', 'Air Conditioner', 'Microwave', 'Dishwasher'],
  Furniture:   ['Sofa', 'Bed', 'Dining Table', 'Wardrobe'],
  Automobile:  ['Car', 'Bike', 'Scooter'],
  Other:       ['Other'],
};

const MOCK = [
  { plan_id:1, category:'Electronics', sub_category:'Mobile Phone',    plan_years:1, min_price:5000,  max_price:15000, plan_price:999,  status:1 },
  { plan_id:2, category:'Electronics', sub_category:'Mobile Phone',    plan_years:2, min_price:5000,  max_price:15000, plan_price:1499, status:1 },
  { plan_id:3, category:'Electronics', sub_category:'Laptop',          plan_years:1, min_price:30000, max_price:80000, plan_price:2499, status:1 },
  { plan_id:4, category:'Electronics', sub_category:'Television',      plan_years:1, min_price:15000, max_price:50000, plan_price:1299, status:1 },
  { plan_id:5, category:'Appliances',  sub_category:'Refrigerator',    plan_years:2, min_price:20000, max_price:60000, plan_price:2999, status:1 },
  { plan_id:6, category:'Appliances',  sub_category:'Washing Machine', plan_years:2, min_price:15000, max_price:40000, plan_price:1999, status:1 },
  { plan_id:7, category:'Appliances',  sub_category:'Air Conditioner', plan_years:1, min_price:25000, max_price:60000, plan_price:1799, status:1 },
];

export default function AdminPlans() {
  // --- State ---
  const [plans, setPlans]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editData, setEditData]     = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('all');
  const [saving, setSaving]         = useState(false);
  const [selectedCat, setSelectedCat] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const watchCat = watch('category', '');

  // --- Data Fetching ---
  const load = () => {
    getPlans()
      .then(r => { setPlans(r.data); setFiltered(r.data); })
      .catch(() => { setPlans(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  // --- Search & Filtering ---
  useEffect(() => {
    let res = plans;
    if (filterCat !== 'all') {
      res = res.filter(p => p.category === filterCat);
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(p => p.category?.toLowerCase().includes(q) || p.sub_category?.toLowerCase().includes(q));
    }
    setFiltered(res);
  }, [search, filterCat, plans]);

  // --- Handlers ---
  const openCreate = () => { setEditData(null); reset({}); setSelectedCat(''); setModalOpen(true); };
  const openEdit   = (p)  => { setEditData(p); reset(p); setSelectedCat(p.category); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editData) { 
        await updatePlan({ ...data, plan_id: editData.plan_id }); 
        toast.success('Plan updated successfully'); 
      } else { 
        await createPlan(data); 
        toast.success('Plan created successfully'); 
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
      await deletePlan(deleteId); 
      toast.success('Plan deleted successfully'); 
      load(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Cannot delete this plan'); 
    }
    setDeleteId(null);
  };

  const allCats = ['all', ...new Set(plans.map(p => p.category))];

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
        title="Warranty Plans" 
        subtitle={`${plans.length} plans currently configured in the system`}
        action={
          <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm">
            <Plus size={16}/> 
            Add Plan
          </button>
        } 
      />

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 mt-6">
        <div className="w-full md:max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search plans..." />
        </div>
        <div className="flex gap-2 flex-wrap md:ml-auto">
          {allCats.map(c => (
            <button 
              key={c} 
              onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 border ${
                filterCat === c 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                  : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Package} 
            title="No plans found" 
            description={search || filterCat !== 'all' ? "Try adjusting your filters or search query." : "Create your first warranty plan to get started."} 
            action={!search && filterCat === 'all' && <button onClick={openCreate} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-6 py-2.5 transition-all">Create Plan</button>} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Sub Category</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Product Price Range</th>
                  <th className="px-6 py-4">Plan Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map(p => (
                  <tr key={p.plan_id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 text-sm font-medium">
                      {p.sub_category || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-zinc-200 text-sm">
                        {p.plan_years} Year{p.plan_years > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 text-sm font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800/80">
                        ₹{Number(p.min_price).toLocaleString()} <span className="text-zinc-600 mx-1">–</span> ₹{Number(p.max_price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 font-mono font-bold text-base">
                        ₹{Number(p.plan_price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.status ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          <CheckCircle2 size={12}/> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium">
                          <XCircle size={12}/> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => setDeleteId(p.plan_id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Delete">
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Warranty Plan' : 'Create Warranty Plan'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Category" error={errors.category?.message}>
              <select 
                className={`${inputClass} appearance-none cursor-pointer`} 
                {...register('category', { required: 'Category is required' })}
                onChange={e => { setSelectedCat(e.target.value); setValue('sub_category', ''); }}
              >
                <option value="" disabled className="text-zinc-500">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            
            <FormField label="Sub Category">
              <select className={`${inputClass} appearance-none cursor-pointer`} {...register('sub_category')}>
                <option value="" className="text-zinc-500">Select sub-category...</option>
                {(SUB_CATEGORIES[selectedCat || watchCat] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            
            <FormField label="Plan Duration" error={errors.plan_years?.message}>
              <select className={`${inputClass} appearance-none cursor-pointer`} {...register('plan_years', { required: 'Duration is required' })}>
                <option value="" disabled className="text-zinc-500">Select years...</option>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>{y} Year{y>1?'s':''}</option>)}
              </select>
            </FormField>
            
            <FormField label="Status">
              <select className={`${inputClass} appearance-none cursor-pointer`} {...register('status')}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </FormField>
          </div>

          {/* Price Range Target Box */}
          <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Applicable Product Price Range</p>
              <p className="text-xs text-zinc-500 mt-1">This plan will only apply to products whose sale price falls within this range.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Minimum Price (₹)" error={errors.min_price?.message}>
                <input className={`${inputClass} font-mono`} type="number" placeholder="5000" {...register('min_price', { required: 'Required', min: 1 })} />
              </FormField>
              <FormField label="Maximum Price (₹)" error={errors.max_price?.message}>
                <input className={`${inputClass} font-mono`} type="number" placeholder="15000" {...register('max_price', { required: 'Required', min: 1 })} />
              </FormField>
            </div>
          </div>

          {/* Final Plan Price */}
          <div className="border-t border-zinc-800/50 pt-5">
            <FormField label="Warranty Plan Price (₹)" error={errors.plan_price?.message}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 font-medium">₹</div>
                <input 
                  className={`${inputClass} pl-8 font-mono text-lg font-semibold text-emerald-400`} 
                  type="number" 
                  step="0.01" 
                  placeholder="999" 
                  {...register('plan_price', { required: 'Price is required', min: { value: 1, message: 'Must be > 0' } })} 
                />
              </div>
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
                  Saving...
                </span>
              ) : editData ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={onDelete}
        title="Delete Warranty Plan" 
        message="Are you sure? You cannot delete plans that have already been sold to customers. Consider setting the status to 'Inactive' instead." 
        danger 
      />
      
    </div>
  );
}