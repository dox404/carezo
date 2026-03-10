import { useEffect, useState } from 'react';
import { getWallet, createPayOrder, verifyPayment } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Spinner } from '../../components/UI';
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK = [500, 1000, 2000, 5000];

export default function DealerWallet() {
  const { user, updateWallet } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [txns, setTxns]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [amount, setAmount]         = useState('');
  const [paying, setPaying]         = useState(false);

  const load = () => {
    getWallet()
      .then(r => {
        setWalletData(r.data.wallet);
        setTxns(r.data.transactions);
      })
      .catch(() => {
        setWalletData({ balance: user?.wallet || 0 });
        setTxns(Array.from({ length: 5 }, (_, i) => ({
          transaction_id: i + 1, 
          type: ['Debit', 'Credit'][i % 2],
          amount: [999, 2000, 1499][i % 3],
          description: ['Plan sold - INV-001', 'Wallet recharge', 'Plan sold - INV-002'][i % 3],
          created_at: new Date(Date.now() - i * 5 * 3600000).toLocaleString()
        })));
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const recharge = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) return toast.error('Minimum recharge amount is ₹100');
    
    setPaying(true);
    try {
      const { data } = await createPayOrder(amt);
      const options = {
        key: data.key, 
        amount: data.amount, 
        currency: 'INR',
        name: 'Carezo', 
        description: 'Dealer Wallet Recharge', 
        order_id: data.order_id,
        handler: async (response) => {
          try {
            const vRes = await verifyPayment({
              order_id: data.order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            updateWallet(vRes.data.new_balance);
            toast.success(`₹${amt} added to your wallet!`);
            setAmount('');
            load();
          } catch { 
            toast.error('Payment verification failed'); 
          }
        },
        prefill: { contact: user?.mobile || '' },
        theme: { color: '#4f46e5' }, // Indigo-600
      };
      
      if (window.Razorpay) {
        new window.Razorpay(options).open();
      } else { 
        toast.success(`[DEV MODE] ₹${amt} simulated`); 
        updateWallet(Number(user?.wallet || 0) + amt); 
      }
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Payment initiation failed'); 
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );

  const balance = Number(walletData?.balance || user?.wallet || 0);
  const credits = txns.filter(t => t.type === 'Credit').reduce((s, t) => s + Number(t.amount), 0);
  const debits  = txns.filter(t => t.type === 'Debit').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="animate-fade-up font-sans">
      
      <PageHeader 
        title="My Wallet" 
        subtitle="Manage your balance, add funds, and view transaction history" 
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8 mt-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-900/50 via-zinc-900 to-zinc-950 border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative z-10">
            <Wallet size={24} className="text-indigo-400" />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-400 text-sm font-medium mb-1">Available Balance</p>
            <p className="text-4xl font-bold font-mono text-white tracking-tight">₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="flex gap-6 mt-6 pt-5 border-t border-indigo-500/10 relative z-10">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Total Added</p>
              <p className="text-sm font-bold font-mono text-emerald-400">+₹{credits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Total Used</p>
              <p className="text-sm font-bold font-mono text-rose-400">-₹{debits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recharge Card */}
        <div className="lg:col-span-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-lg mb-1">Recharge Wallet</h3>
            <p className="text-sm text-zinc-400 mb-6">Add funds to instantly purchase warranty plans for your customers.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {QUICK.map(a => (
                <button 
                  key={a} 
                  onClick={() => setAmount(String(a))}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    amount === String(a) 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  + ₹{a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">₹</span>
                <input 
                  type="number" 
                  placeholder="Custom amount" 
                  className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-xl pl-10 pr-4 py-3.5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-zinc-600 font-mono"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  min={100} 
                />
              </div>
              <button 
                onClick={recharge} 
                disabled={paying || !amount} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl px-8 py-3.5 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:w-auto w-full"
              >
                {paying ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pay Now
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500 font-medium">
              <ShieldCheck size={14} className="text-emerald-500/70" />
              <span>Secure payments powered by Razorpay. Minimum recharge ₹100.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/30">
          <h3 className="font-semibold text-white text-lg">Transaction History</h3>
        </div>
        
        {txns.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            No transactions found in your wallet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {txns.map(t => (
              <div key={t.transaction_id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                  t.type === 'Credit' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  {t.type === 'Credit' ? <ArrowDownRight size={20}/> : <ArrowUpRight size={20}/>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium truncate">{t.description}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.created_at}</p>
                </div>
                
                <div className="text-right">
                  <span className={`font-mono font-bold text-base ${t.type === 'Credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'Credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}