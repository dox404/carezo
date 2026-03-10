import { useEffect, useState } from 'react'
import { getAllPolicies, cancelPolicy } from '../../api/index'
import { PageHeader, Spinner, SearchInput, ConfirmDialog } from '../../components/UI'
import { FileText, XCircle, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK = Array.from({ length: 10 }, (_, i) => ({
  id: i+1, customer_id: `CRZ${100+i}ABC`, dealer_name: `Dealer ${(i%5)+1}`,
  plan_name: ['Basic Health', 'Life Cover', 'Motor Basic'][i%3],
  customer_name: `Customer ${i+1}`, customer_mobile: `9876${500000+i}`,
  amount_paid: [999,2499,1499,3999][i%4], status: i === 2 ? 'cancelled' : 'active',
  sold_at: new Date(Date.now() - i*86400000).toLocaleDateString()
}))

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [cancelId, setCancelId] = useState(null)

  const load = async () => {
    try { const r = await getAllPolicies(); setPolicies(r.data); setFiltered(r.data) }
    catch { setPolicies(MOCK); setFiltered(MOCK) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(policies.filter(p => p.customer_id?.toLowerCase().includes(q) || p.customer_name?.toLowerCase().includes(q) || p.plan_name?.toLowerCase().includes(q)))
  }, [search, policies])

  const onCancel = async () => {
    try { await cancelPolicy(cancelId); toast.success('Policy cancelled & wallet refunded'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Policies" subtitle={`${policies.filter(p=>p.status==='active').length} active policies`}
        action={<button className="btn-ghost flex items-center gap-2 text-sm"><Download size={15}/> Export CSV</button>} />

      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by customer, ID, plan..." />
        <div className="flex gap-2 ml-auto">
          <span className="badge-active">{policies.filter(p=>p.status==='active').length} Active</span>
          <span className="badge-inactive">{policies.filter(p=>p.status==='cancelled').length} Cancelled</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Customer ID</th><th>Customer</th><th>Plan</th><th>Dealer</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="font-mono text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">{p.customer_id}</span></td>
                  <td>
                    <p className="font-medium text-dark-100">{p.customer_name}</p>
                    <p className="text-xs text-dark-500">{p.customer_mobile}</p>
                  </td>
                  <td className="text-dark-300">{p.plan_name}</td>
                  <td className="text-dark-400 text-xs">{p.dealer_name}</td>
                  <td className="font-mono font-semibold text-white">₹{Number(p.amount_paid).toLocaleString()}</td>
                  <td><span className={p.status === 'active' ? 'badge-active' : 'badge-inactive'}>{p.status}</span></td>
                  <td className="text-dark-500 text-xs">{p.sold_at}</td>
                  <td>
                    {p.status === 'active' && (
                      <button onClick={() => setCancelId(p.id)} className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Cancel policy">
                        <XCircle size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog open={!!cancelId} onClose={() => setCancelId(null)} onConfirm={onCancel}
        title="Cancel Policy" message="This will cancel the policy and refund the full amount to dealer's wallet." danger />
    </div>
  )
}