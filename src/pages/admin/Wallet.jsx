import { useEffect, useState } from 'react';
import { getDealers, getWallet, creditWallet } from '../../api/index';
import { PageHeader, Spinner, Modal, FormField } from '../../components/UI';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, History, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

// Extracted common input class for consistent form styling
const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600";

const MOCK_DEALERS = Array.from({ length: 6 }, (_, i) => ({
  dealer_id: i + 1, 
  shop_name: `Shop ${i + 1}`, 
  primary_contact_name: `Owner ${i + 1}`,
  wallet_balance: (Math.random() * 8000 + 500).toFixed(2),
}));

export default function AdminWallet() {
  // --- State ---
  const [dealers, setDealers]         = useState([]);
  const [txns, setTxns]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [amount, setAmount]           = useState('');
  const [desc, setDesc]               = useState('');
  const [saving, setSaving]           = useState(false);
  const [txnLoading, setTxnLoading]   = useState(false);
  const [activeDealerId, setActiveDealerId] = useState(null);

  // --- Mocks ---
  const MOCK_TXNS = Array.from({ length: 10 }, (_, i) => ({
    transaction_id: i + 1, 
    dealer_id: (i % 6) + 1,
    shop_name: `Shop ${(i % 6) + 1}`,
    type: i % 3 === 0 ? 'Credit' : 'Debit',
    amount: [500, 1000, 999, 2000][i % 4],
    description: ['Admin credit', 'Plan sold - INV-001', 'Wallet recharge'][i % 3],
    created_at: new Date(Date.now() - i * 3600000 * 6).toLocaleString()
  }));

  // --- Data Fetching ---
  const load = () => {
    getDealers()
      .then(r => setDealers(r.data))
      .catch(() => setDealers(MOCK_DEALERS))
      .finally(() => setLoading(false));
    setTxns(MOCK_TXNS);
  };
  
  useEffect(() => { load(); }, []);

  const loadTxns = async (dealer_id) => {
    setActiveDealerId(dealer_id);
    setTxnLoading(true);
    try {
      const res = await getWallet(dealer_id);
      setTxns(res.data.transactions);
    } catch { 
      // Filter mock txns for visual feedback during development
      setTxns(MOCK_TXNS.filter(t => t.dealer_id === dealer_id)); 
    } finally {
      setTxnLoading(false);
    }
  };

  // --- Handlers ---
  const openCredit = (d) => { 
    setSelected(d); 
    setAmount(''); 
    setDesc(''); 
    setModalOpen(true); 
  };

  const onCredit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');
    
    setSaving(true);
    try {
      await creditWallet({ dealer_id: selected.dealer_id, amount: Number(amount), description: desc || 'Admin credit' });
      toast.success(`₹${amount} credited to ${selected.shop_name}`);
      setModalOpen(false);
      load();
      if (activeDealerId === selected.dealer_id) {
        loadTxns(selected.dealer_id);
      }
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Credit failed'); 
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  const totalBalance = dealers.reduce((s, d) => s + Number(d.wallet_balance || 0), 0);

  return (
    <div className="animate-fade-up font-sans">
      
      {/* Header */}
      <PageHeader 
        title="Dealer Wallets" 
        subtitle={`Total network balance: ₹${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
      />

      <div className="grid lg:grid-cols-5 gap-8 mt-6">
        
        {/* Left Col: Dealer List */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <h3 className="font-semibold text-white text-lg">Dealer Balances</h3>
            <p className="text-zinc-400 text-sm">Select a dealer to view their transaction history</p>
          </div>
          
          <div className="space-y-3">
            {dealers.map(d => {
              const isActive = activeDealerId === d.dealer_id;
              return (
                <div 
                  key={d.dealer_id} 
                  onClick={() => loadTxns(d.dealer_id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isActive 
                      ? 'bg-zinc-800/80 border-indigo-500/30 ring-1 ring-indigo-500/50 shadow-lg' 
                      : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-colors ${
                    isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'
                  }`}>
                    {d.shop_name[0].toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-100 truncate">{d.shop_name}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{d.primary_contact_name}</p>
                  </div>
                  
                  <div className="text-right pr-2">
                    <p className="font-mono font-bold text-emerald-400 text-lg">
                      ₹{Number(d.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <button 
                    onClick={e => { e.stopPropagation(); openCredit(d); }}
                    className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all flex-shrink-0"
                    title="Credit Wallet"
                  >
                    <Plus size={18}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Transactions */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-white text-lg">
              Recent Transactions
            </h3>
            {txnLoading && <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />}
          </div>
          
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
            {txns.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50">
                  <History size={28} className="text-zinc-500"/>
                </div>
                <p className="text-zinc-300 font-medium mb-1">No transactions found</p>
                <p className="text-zinc-500 text-sm">Select a dealer or credit a wallet to see history.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/50 custom-scrollbar">
                {txns.slice(0, 15).map(t => (
                  <div key={t.transaction_id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      t.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {t.type === 'Credit' ? <ArrowDownRight size={18}/> : <ArrowUpRight size={18}/>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm font-medium truncate">{t.description}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{t.shop_name || `Dealer #${t.dealer_id}`} · {t.created_at}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`font-mono font-bold text-sm ${t.type === 'Credit' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {t.type === 'Credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Credit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Credit Dealer Wallet" size="md">
        <form onSubmit={onCredit} className="space-y-5 mt-4">
          
          {/* Target Info */}
          <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Crediting to</p>
              <p className="text-sm font-semibold text-zinc-200">{selected?.shop_name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-0.5">Current Balance</p>
              <p className="font-mono font-bold text-emerald-400">₹{Number(selected?.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <FormField label="Amount to Credit (₹)">
            <div className="space-y-3">
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map(a => (
                  <button 
                    key={a} 
                    type="button" 
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all border ${
                      amount === String(a) 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    + {a}
                  </button>
                ))}
              </div>
              
              {/* Custom Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 font-medium">
                  <IndianRupee size={16} />
                </div>
                <input 
                  type="number" 
                  className={`${inputClass} pl-10 font-mono text-lg font-bold text-emerald-400`} 
                  placeholder="Custom amount..." 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  min={1} 
                />
              </div>
            </div>
          </FormField>

          <FormField label="Transaction Notes">
            <input 
              className={inputClass} 
              placeholder="e.g. Manual recharge, Bonus credit..." 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
            />
          </FormField>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-zinc-800 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus size={18}/>
                  Credit Wallet
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
      
    </div>
  );
}