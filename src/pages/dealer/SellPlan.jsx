import { useEffect, useState } from 'react';
import { getPlans, getProducts, lookupPincode, createSale } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { Spinner, FormField } from '../../components/UI';
import { ShoppingCart, CheckCircle, Copy, Search, Package, Calendar, Upload, AlertCircle, ShieldCheck, Tag,Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

const MOCK_PLANS = [
  { plan_id:1, category:'Electronics', sub_category:'Mobile Phone', plan_years:1, min_price:5000,  max_price:15000,  plan_price:999 },
  { plan_id:2, category:'Electronics', sub_category:'Mobile Phone', plan_years:2, min_price:5000,  max_price:15000,  plan_price:1499 },
  { plan_id:3, category:'Electronics', sub_category:'Laptop',       plan_years:1, min_price:30000, max_price:80000,  plan_price:2499 },
  { plan_id:4, category:'Electronics', sub_category:'Television',   plan_years:1, min_price:15000, max_price:50000,  plan_price:1299 },
  { plan_id:5, category:'Electronics', sub_category:'Refrigerator', plan_years:2, min_price:20000, max_price:60000,  plan_price:2999 },
];
const MOCK_PRODUCTS = [
  { product_id:1, category:'Electronics', sub_category:'Mobile Phone', brand_name:'Samsung',   model_name:'Galaxy S23' },
  { product_id:2, category:'Electronics', sub_category:'Mobile Phone', brand_name:'Apple',     model_name:'iPhone 15' },
  { product_id:3, category:'Electronics', sub_category:'Laptop',       brand_name:'Dell',      model_name:'Inspiron 15' },
  { product_id:4, category:'Electronics', sub_category:'Television',   brand_name:'LG',        model_name:'55 inch OLED' },
  { product_id:5, category:'Electronics', sub_category:'Refrigerator', brand_name:'Whirlpool', model_name:'340L Double Door' },
];

export default function SellPlan() {
  // --- State ---
  const { user, updateWallet } = useAuth();
  const [plans, setPlans]                 = useState([]);
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [step, setStep]                   = useState(1); // 1=select product+plan, 2=details form, 3=success
  const [selectedPlan, setSelectedPlan]   = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [result, setResult]               = useState(null);
  const [selling, setSelling]             = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [filterCat, setFilterCat]         = useState('all');
  const [salePrice, setSalePrice]         = useState('');
  const [matchingPlans, setMatchingPlans] = useState([]);
  const [invoiceFile, setInvoiceFile]     = useState(null);
  const [serialFile, setSerialFile]       = useState(null);
  const [pinLoading, setPinLoading]       = useState(false);
  const [locationId, setLocationId]       = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // --- Data Fetching ---
  useEffect(() => {
    Promise.all([
      getPlans().then(r => setPlans(r.data)).catch(() => setPlans(MOCK_PLANS)),
      getProducts().then(r => setProducts(r.data)).catch(() => setProducts(MOCK_PRODUCTS)),
    ]).finally(() => setLoading(false));
  }, []);

  // --- Search & Filtering ---
  useEffect(() => {
    if (!selectedProduct || !salePrice) { 
      setMatchingPlans([]); 
      return; 
    }
    const price = parseFloat(salePrice);
    const matched = plans.filter(p =>
      p.sub_category === selectedProduct.sub_category &&
      price >= p.min_price && price <= p.max_price
    );
    setMatchingPlans(matched);
    setSelectedPlan(null); // Reset plan if price changes
  }, [selectedProduct, salePrice, plans]);

  const categories = ['all', ...new Set(products.map(p => p.sub_category))];
  
  const filteredProducts = products.filter(p => {
    if (filterCat !== 'all' && p.sub_category !== filterCat) return false;
    if (searchProduct && !`${p.brand_name} ${p.model_name}`.toLowerCase().includes(searchProduct.toLowerCase())) return false;
    return true;
  });

  // --- Handlers ---
  const lookupPin = async (pin) => {
    if (pin?.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await lookupPincode(pin);
      if (res.data?.length > 0) {
        const loc = res.data[0];
        setValue('customer_address', `${loc.district}, ${loc.state}`);
        setLocationId(loc.location_id);
        toast.success(`Location found: ${loc.district}, ${loc.state}`);
      } else { 
        toast.error('Pincode not found'); 
      }
    } catch { 
      toast.error('Pincode lookup failed'); 
    } finally {
      setPinLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedPlan) return toast.error('Please select a warranty plan');
    setSelling(true);
    try {
      const fd = new FormData();
      fd.append('product_id',          selectedProduct.product_id);
      fd.append('plan_id',             selectedPlan.plan_id);
      fd.append('sale_price',          salePrice);
      fd.append('serial_number',       data.serial_number);
      fd.append('purchase_date',       data.purchase_date);
      fd.append('brand_warranty_years',data.brand_warranty_years || 1);
      fd.append('customer_name',       data.customer_name);
      fd.append('contact_number',      data.contact_number);
      fd.append('customer_email',      data.customer_email || '');
      fd.append('customer_address',    data.customer_address || '');
      
      if (locationId)  fd.append('location_id',   locationId);
      if (invoiceFile) fd.append('invoice_image', invoiceFile);
      if (serialFile)  fd.append('serial_image',  serialFile);

      const res = await createSale(fd);
      setResult(res.data);
      updateWallet(Number(user.wallet) - selectedPlan.plan_price);
      setStep(3);
      toast.success('Sale recorded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sale failed to process');
    } finally {
      setSelling(false);
    }
  };

  const resetAll = () => {
    setStep(1); 
    setSelectedPlan(null); 
    setSelectedProduct(null);
    setResult(null); 
    setSalePrice(''); 
    setMatchingPlans([]);
    setInvoiceFile(null); 
    setSerialFile(null); 
    reset();
  };

  // --- Render ---
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  const walletBalance = Number(user?.wallet || 0);

  // ── Step 3: Success ───────────────────────────────
  if (step === 3) return (
    <div className="max-w-xl mx-auto text-center py-12 animate-fade-up font-sans">
      <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
        <CheckCircle size={48} className="text-emerald-400" />
      </div>
      <h2 className="font-bold text-white text-3xl tracking-tight mb-2">Sale Recorded Successfully!</h2>
      <p className="text-zinc-400 mb-8 font-medium">The warranty plan has been activated.</p>

      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 text-left space-y-4 mb-8 shadow-2xl">
        {[
          { label: 'Invoice Number', value: result?.invoice_number, mono: true, highlight: true },
          { label: 'Product Details',value: `${selectedProduct?.brand_name} ${selectedProduct?.model_name}` },
          { label: 'Warranty Plan',  value: `${selectedPlan?.sub_category} · ${selectedPlan?.plan_years} Year Plan` },
          { label: 'Product Price',  value: `₹${Number(salePrice).toLocaleString()}` },
          { label: 'Plan Cost',      value: `₹${Number(selectedPlan?.plan_price).toLocaleString()}`, mono: true, color: 'text-indigo-400' },
          { label: 'Warranty Start', value: result?.warranty_start },
          { label: 'Warranty End',   value: result?.warranty_end, highlight: true },
        ].map(({ label, value, mono, highlight, color }, i) => (
          <div key={label} className={`flex justify-between items-center py-3 ${i !== 0 ? 'border-t border-zinc-800/50' : ''}`}>
            <span className="text-zinc-400 text-sm font-medium">{label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'text-emerald-400 font-bold text-base' : (color || 'text-zinc-100 font-semibold')}`}>
                {value}
              </span>
              {label === 'Invoice Number' && (
                <button 
                  onClick={() => { navigator.clipboard.writeText(result?.invoice_number); toast.success('Invoice copied to clipboard!'); }}
                  className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                  title="Copy Invoice Number"
                >
                  <Copy size={14}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={resetAll} 
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl px-4 py-3.5 transition-all duration-200 border border-zinc-700"
      >
        Record Another Sale
      </button>
    </div>
  );

  // ── Step 2: Details Form ──────────────────────────
  if (step === 2) return (
    <div className="max-w-3xl mx-auto animate-fade-up font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setStep(1)} 
          className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="font-bold text-white text-2xl tracking-tight">Enter Sale Details</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-zinc-400 text-sm">{selectedProduct?.brand_name} {selectedProduct?.model_name}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-indigo-400 text-sm font-medium">{selectedPlan?.plan_years} Year Plan</span>
          </div>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Sale Price',     value: `₹${Number(salePrice).toLocaleString()}`, color: 'text-zinc-100',  bg: 'bg-zinc-900/80 border-zinc-800' },
          { label: 'Plan Cost',      value: `₹${Number(selectedPlan?.plan_price).toLocaleString()}`, color: 'text-rose-400',  bg: 'bg-rose-500/10 border-rose-500/20' },
          { label: 'Wallet Balance After', value: `₹${(walletBalance - selectedPlan?.plan_price).toFixed(2)}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border backdrop-blur-md ${s.bg}`}>
            <p className="text-xs text-zinc-400 font-medium mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Product Information Box */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/80 pb-3">
            <Package size={18} className="text-indigo-400" />
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Product Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 md:col-span-1">
              <FormField label="Serial Number / IMEI" error={errors.serial_number?.message}>
                <input className={inputClass} placeholder="SN123456789" {...register('serial_number', { required: 'Serial number is required' })} />
              </FormField>
            </div>
            
            <FormField label="Purchase Date" error={errors.purchase_date?.message}>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  className={`${inputClass} pl-10 [color-scheme:dark]`} 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  {...register('purchase_date', { required: 'Purchase date is required' })} 
                />
              </div>
            </FormField>
            
            <FormField label="Brand Warranty Status">
              <select className={`${inputClass} appearance-none cursor-pointer`} {...register('brand_warranty_years')}>
                <option value={0}>No existing brand warranty</option>
                <option value={1}>1 Year Brand Warranty</option>
                <option value={2}>2 Years Brand Warranty</option>
                <option value={3}>3 Years Brand Warranty</option>
              </select>
            </FormField>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 pt-5 border-t border-zinc-800/50">
            <FormField label="Invoice Document (Optional)">
              <label className="flex items-center gap-3 w-full bg-zinc-950 border border-zinc-800 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-indigo-500/20">
                  <Upload size={14} className="text-zinc-400 group-hover:text-indigo-400 transition-colors"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-300 truncate">{invoiceFile ? invoiceFile.name : 'Upload Invoice'}</p>
                  <p className="text-xs text-zinc-500">Images or PDF</p>
                </div>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setInvoiceFile(e.target.files[0])} />
              </label>
            </FormField>
            
            <FormField label="Serial Number Image (Optional)">
              <label className="flex items-center gap-3 w-full bg-zinc-950 border border-zinc-800 border-dashed rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-indigo-500/20">
                  <Upload size={14} className="text-zinc-400 group-hover:text-indigo-400 transition-colors"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-300 truncate">{serialFile ? serialFile.name : 'Upload SN Image'}</p>
                  <p className="text-xs text-zinc-500">Image file only</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setSerialFile(e.target.files[0])} />
              </label>
            </FormField>
          </div>
        </div>

        {/* Customer Information Box */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/80 pb-3">
            <ShieldCheck size={18} className="text-indigo-400" />
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Customer Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <FormField label="Customer Full Name" error={errors.customer_name?.message}>
                <input className={inputClass} placeholder="e.g. Rajesh Kumar" {...register('customer_name', { required: 'Customer name is required' })} />
              </FormField>
            </div>
            
            <FormField label="Mobile Number" error={errors.contact_number?.message}>
              <input 
                className={inputClass} 
                type="tel" 
                placeholder="9876543210"
                {...register('contact_number', { required: 'Mobile number is required', minLength: { value: 10, message: 'Must be at least 10 digits' } })} 
              />
            </FormField>
            
            <FormField label="Email Address (Optional)">
              <input className={inputClass} type="email" placeholder="customer@email.com" {...register('customer_email')} />
            </FormField>
            
            <FormField label="Pincode">
              <div className="relative">
                <input 
                  className={`${inputClass} pr-16`} 
                  type="text" 
                  maxLength={6} 
                  placeholder="e.g. 400001"
                  onChange={e => { if (e.target.value.length === 6) lookupPin(e.target.value); }} 
                />
                {pinLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-medium text-indigo-400">
                    <span className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"/>
                  </div>
                )}
              </div>
            </FormField>
            
            <FormField label="City & State">
              <input 
                className={`${inputClass} bg-zinc-900/50 cursor-not-allowed`} 
                placeholder="Auto-filled from pincode" 
                readOnly
                {...register('customer_address')} 
              />
            </FormField>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <button type="button" onClick={() => setStep(1)} className="w-full sm:w-1/3 px-4 py-3.5 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
            Go Back
          </button>
          <button 
            type="submit" 
            disabled={selling} 
            className="w-full sm:w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {selling ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Processing Sale...
              </>
            ) : (
              <>
                <ShoppingCart size={18}/>
                Confirm & Record Sale
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // ── Step 1: Select Product + Plan ─────────────────
  return (
    <div className="animate-fade-up font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-bold text-white text-3xl tracking-tight">Record New Sale</h1>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Select a product and matching warranty plan to proceed.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-5 py-3 rounded-2xl shadow-sm w-fit">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <Wallet size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Available Balance</p>
            <p className="font-mono font-bold text-zinc-100">₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Left Column: Product Selection */}
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0">1</div>
            <h2 className="font-bold text-white text-xl">Select Product</h2>
          </div>
          
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col flex-1">
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map(c => (
                <button 
                  key={c} 
                  onClick={() => setFilterCat(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 border ${
                    filterCat === c 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"/>
              <input 
                className={`${inputClass} pl-10`} 
                placeholder="Search brand or model name..."
                value={searchProduct} 
                onChange={e => setSearchProduct(e.target.value)} 
              />
            </div>
            
            {/* Product List */}
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2 mb-6">
              {filteredProducts.map(p => {
                const isSelected = selectedProduct?.product_id === p.product_id;
                return (
                  <div 
                    key={p.product_id} 
                    onClick={() => setSelectedProduct(p)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-4 border ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/50 shadow-md' 
                        : 'bg-zinc-950/50 border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      <Package size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isSelected ? 'text-indigo-100' : 'text-zinc-200'}`}>
                        {p.brand_name} {p.model_name}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-300' : 'text-zinc-500'}`}>
                        {p.category} · {p.sub_category}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-zinc-500 text-sm">No products found matching your search.</div>
              )}
            </div>

            {/* Price Input Block */}
            <div className={`transition-all duration-300 ${selectedProduct ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  What is the final sale price of the product?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 font-medium">₹</div>
                  <input 
                    className={`${inputClass} pl-8 font-mono text-lg font-bold text-emerald-400 focus:ring-emerald-500/50 focus:border-emerald-500`} 
                    type="number" 
                    placeholder="e.g. 15000"
                    value={salePrice} 
                    onChange={e => setSalePrice(e.target.value)} 
                    disabled={!selectedProduct}
                  />
                </div>
                {salePrice && matchingPlans.length === 0 && (
                  <p className="text-rose-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12}/> No warranty plans available for this price bracket.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Plan Selection */}
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0">2</div>
            <h2 className="font-bold text-white text-xl">Select Warranty Plan</h2>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col flex-1">
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {!selectedProduct ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <Package size={48} className="text-zinc-600 mb-4" />
                  <p className="text-zinc-400 font-medium">Select a product first</p>
                  <p className="text-zinc-500 text-sm mt-1">Choose an item from the catalog to see eligible plans.</p>
                </div>
              ) : !salePrice ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <Tag size={48} className="text-zinc-600 mb-4" />
                  <p className="text-zinc-400 font-medium">Enter the sale price</p>
                  <p className="text-zinc-500 text-sm mt-1">Warranty plan costs depend on the final price of the product.</p>
                </div>
              ) : matchingPlans.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <AlertCircle size={48} className="text-rose-500/50 mb-4" />
                  <p className="text-zinc-300 font-medium">No Eligible Plans</p>
                  <p className="text-zinc-500 text-sm mt-1 max-w-xs">We couldn't find any warranty plans for a {selectedProduct.sub_category} priced at ₹{salePrice}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingPlans.map(plan => {
                    const canAfford = walletBalance >= plan.plan_price;
                    const isSelected = selectedPlan?.plan_id === plan.plan_id;
                    
                    return (
                      <div 
                        key={plan.plan_id}
                        onClick={() => canAfford && setSelectedPlan(plan)}
                        className={`p-5 rounded-2xl transition-all duration-200 border ${
                          !canAfford 
                            ? 'opacity-60 cursor-not-allowed bg-zinc-950/50 border-zinc-800/50' 
                            : isSelected 
                              ? 'cursor-pointer bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/50 shadow-md' 
                              : 'cursor-pointer bg-zinc-950/50 border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck size={16} className={isSelected ? 'text-indigo-400' : 'text-zinc-400'} />
                              <p className={`font-semibold ${isSelected ? 'text-indigo-100' : 'text-zinc-200'}`}>
                                {plan.sub_category} Extended Warranty
                              </p>
                            </div>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 mb-2 ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-400'}`}>
                              {plan.plan_years} Year{plan.plan_years > 1 ? 's' : ''} Cover
                            </span>
                            <p className="text-xs text-zinc-500 font-mono">
                              Applies to items ₹{Number(plan.min_price).toLocaleString()} – ₹{Number(plan.max_price).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold font-mono ${isSelected ? 'text-indigo-400' : 'text-zinc-100'}`}>
                              ₹{Number(plan.plan_price).toLocaleString()}
                            </p>
                            {!canAfford && (
                              <p className="text-rose-400 text-xs font-medium mt-1">Insufficient Funds</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Action Area */}
            <div className={`mt-4 pt-4 border-t border-zinc-800 transition-all duration-300 ${selectedPlan ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
              <button 
                onClick={() => setStep(2)} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3.5 transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                Proceed to Details <Calendar size={18}/>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}