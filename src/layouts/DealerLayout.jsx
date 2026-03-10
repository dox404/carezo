import { Outlet } from 'react-router-dom'
import DealerNavbar from '../components/DealerNavbar'

export default function DealerLayout() {
  return (
    <div className="min-h-screen bg-dark-950">
      <DealerNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}