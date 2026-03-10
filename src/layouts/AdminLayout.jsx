import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main */}
      <div className="flex-1 flex lg:ml-64 flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-dark-900 border-b border-dark-700 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-dark-300">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white">Carezo Admin</span>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}