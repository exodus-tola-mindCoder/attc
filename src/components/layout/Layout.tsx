import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Heart,
  GraduationCap,
  Calendar,
  Building,
  MessageSquare,
  ChefHat,
  Star,
  Camera,
  FileText,
  Download,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { messageApi } from '../../services/api';
import ThemeToggle from '../common/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageApi.getUnread();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['admin', 'clinic'] },
    { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['admin', 'student'] },
    { id: 'course-registration', label: 'Course Registration', icon: UserCheck, roles: ['student'] },
    { id: 'semester-management', label: 'Semester Management', icon: CalendarDays, roles: ['admin'] },
    { id: 'instructors', label: 'Instructors', icon: GraduationCap, roles: ['admin', 'student'] },
    { id: 'health', label: 'Health Records', icon: Heart, roles: ['admin', 'clinic'] },
    { id: 'leave', label: 'Leave Applications', icon: Calendar, roles: ['admin', 'student'] },
    { id: 'departments', label: 'Departments', icon: Building, roles: ['admin', 'student'] },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, roles: ['admin', 'student', 'clinic'] },
    { id: 'cafeteria', label: 'Cafeteria', icon: ChefHat, roles: ['admin', 'student'] },
    { id: 'meal-feedback', label: 'Meal Feedback', icon: Star, roles: ['student'] },
    { id: 'graduation-gallery', label: 'Graduation Gallery', icon: Camera, roles: ['admin', 'student'] },
    { id: 'documents', label: 'Document Center', icon: FileText, roles: ['admin', 'student'] },
    { id: 'transcripts', label: 'Transcripts', icon: Download, roles: ['student'] },
    { id: 'messages', label: 'Messages', icon: MessageCircle, roles: ['admin', 'student', 'clinic'] },
    { id: 'profile', label: 'Profile', icon: User, roles: ['student'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">UMS</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 flex-1 overflow-y-auto">
          <div className="px-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4">
              <ThemeToggle variant="dropdown" />

              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;