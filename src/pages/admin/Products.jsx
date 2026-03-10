import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/index';
import { PageHeader, Modal, Spinner, SearchInput, ConfirmDialog, FormField, EmptyState } from '../../components/UI';
import { Box, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

const CATEGORIES = ['Electronics', 'Appliances', 'Furniture', 'Automobile', 'Other'];
const SUB_CATEGORIES = {
  Electronics: ['Mobile Phone', 'Laptop', 'Television', 'Tablet', 'Camera', 'Smartwatch'],
  Appliances:  ['Refrigerator', 'Washing Machine', 'Air Conditioner', 'Microwave'],
  Furniture:   ['Sofa', 'Bed', 'Dining Table', 'Wardrobe'],
  Automobile:  ['Car', 'Bike', 'Scooter'],
  Other:       ['Other'],
};

const MOCK = [
  { product_id:1, category:'Electronics', sub_category:'Mobile Phone',    brand_name:'Samsung',   model_name:'Galaxy S23' },
  { product_id:2, category:'Electronics', sub_category:'Mobile Phone',    brand_name:'Apple',     model_name:'iPhone 15' },
  { product_id:3, category:'Electronics', sub_category:'Laptop',          brand_name:'Dell',      model_name:'Inspiron 15' },
  { product_id:4, category:'Electronics', sub_category:'Television',      brand_name:'LG',        model_name:'55 inch OLED' },
  { product_id:5, category:'Appliances',  sub_category:'Refrigerator',    brand_name:'Whirlpool', model_name:'340L Double Door' },
  { product_id:6, category:'Appliances',  sub_category:'Washing Machine', brand_name:'LG',        model_name:'Front Load 7kg' },
  { product_id:7, category:'Appliances',  sub_category:'Air Conditioner', brand_name:'Daikin',    model_name:'1.5 Ton 5 Star' },
];

export default function AdminProducts() {
  // --- State ---
  const [products, setProducts]       = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editData, setEditData]       = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('all');
  const [saving, setSaving]           = useState(false);
  const [selectedCat, setSelectedCat] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const watchCat = watch('category', '');

  // --- Data Fetching ---
  const load = () => {
    getProducts()
      .then(r => { setProducts(r.data); setFiltered(r.data); })
      .catch(() => { setProducts(MOCK); setFiltered(MOCK); })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  // --- Search & Filtering ---
  useEffect(() => {
    let res = products;
    if (filterCat !== 'all') {
      res = res.filter(p => p.category === filterCat);
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(p => 
        p.brand_name?.toLowerCase().includes(q) || 
        p.model_name?.toLowerCase().includes(q) || 
        p.sub_category?.toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [search, filterCat, products]);

  // --- Handlers ---
  const openCreate = () => { setEditData(null); reset({}); setSelectedCat(''); setModalOpen(true); };
  const openEdit   = (p)  => { setEditData(p); reset(p); setSelectedCat(p.category); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editData) { 
        await updateProduct({ ...data, product_id: editData.product_id }); 
        toast.success('Product updated successfully'); 
      } else { 
        await createProduct(data); 
        toast.success('Product added successfully'); 
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
      await deleteProduct(deleteId); 
      toast.success('Product deleted successfully'); 
      load(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Cannot delete this product'); 
    }
    setDeleteId(null);
  };

  const allCats = ['all', ...new Set(products.map(p => p.category))];

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
        title="Product Master" 
        subtitle={`${products.length} products currently in the catalog`}
        action={
          <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm">
            <Plus size={16}/> 
            Add Product
          </button>
        } 
      />

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 mt-6">
        <div className="w-full md:max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search brand or model..." />
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
            icon={Box} 
            title="No products found" 
            description={search || filterCat !== 'all' ? "Try adjusting your filters or search query." : "Add products to populate the catalog."} 
            action={!search && filterCat === 'all' && <button onClick={openCreate} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-6 py-2.5 transition-all">Add Product</button>} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Sub Category</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map((p, i) => (
                  <tr key={p.product_id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                      {(i + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 text-sm font-medium">
                      {p.sub_category || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {p.brand_name ? p.brand_name[0].toUpperCase() : '-'}
                        </div>
                        <span className="font-semibold text-zinc-100">{p.brand_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {p.model_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => setDeleteId(p.product_id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Delete">
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Product Details' : 'Add New Product'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          </div>

          <div className="border-t border-zinc-800/50 pt-5 mt-2">
            <div className="grid grid-cols-1 gap-5">
              <FormField label="Brand Name" error={errors.brand_name?.message}>
                <input className={inputClass} placeholder="e.g. Samsung, Apple, LG..." {...register('brand_name', { required: 'Brand name is required' })} />
              </FormField>
              
              <FormField label="Model Name">
                <input className={inputClass} placeholder="e.g. Galaxy S23, iPhone 15..." {...register('model_name')} />
              </FormField>
            </div>
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
              ) : editData ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={onDelete}
        title="Remove Product" 
        message="This product will be removed from the catalog. Existing warranties or sales related to this product will not be affected." 
        danger 
      />
      
    </div>
  );
}