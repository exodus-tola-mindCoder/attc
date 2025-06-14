import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'

import {
  Users,
  BarChart3,
} from 'lucide-react';

interface layoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}


const Layout: React.FC<layoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin'] },
  { id: 'students', label: 'Students', icon: Users, roles: ['admin', 'clinic'] },
]

const filteredMenuItems = menuItems.filter(item =>
  item.roles.includes(user?.role || '')
);

return (
  <div className="min-h-screen bg-gray-50">
    {/* Mobile sidebar overlay */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">UMS</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {filteredMenuItems.map((item) => {
            console.log(item)

            return (
              <button>
                helloo
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>

    {/* Main content */}
    <div className="lg:pl-64">
      {/* Top bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  </div>
);
export default Layout;