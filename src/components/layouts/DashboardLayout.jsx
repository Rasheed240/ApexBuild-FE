import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ThemeToggle';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  Building2,
  User,
  ChevronDown,
  Check,
  FolderKanban,
  ClipboardList,
  ListChecks,
  Bell,
  Search,
  CreditCard,
  Loader2,
  Plus,
  HardHat,
  Flag,
  Layers,
  ClipboardCheck,
} from 'lucide-react';
import { useOrganizations } from '../../contexts/OrganizationContext';
import { notificationService } from '../../services/notificationService';

const navigation = [
  { name: 'Dashboard',      href: '/dashboard',      icon: LayoutDashboard },
  { name: 'My Tasks',       href: '/my-tasks',       icon: ListChecks      },
  { name: 'Reviews',        href: '/reviews',        icon: ClipboardCheck  },
  { name: 'Projects',       href: '/projects',       icon: FolderKanban    },
  { name: 'Organizations',  href: '/organizations',  icon: Building2       },
  { name: 'Members',        href: '/members',        icon: Users           },
  { name: 'Subscriptions',  href: '/subscriptions',  icon: CreditCard      },
  { name: 'Notifications',  href: '/notifications',  icon: Bell            },
  { name: 'Profile',        href: '/profile',        icon: User            },
  { name: 'Settings',       href: '/settings',       icon: Settings        },
];

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const {
    organizations = [],
    selectedOrganization,
    selectOrganization,
  } = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const [countResult, unreadResult] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getUnread(),
      ]);
      setUnreadCount(countResult?.UnreadCount ?? countResult?.count ?? countResult?.Count ?? 0);
      setUnreadNotifications(unreadResult?.notifications ?? unreadResult?.Notifications ?? []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const performSearch = async (query) => {
    if (!query.trim() || !selectedOrganization) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Filter navigation items based on query
      const filtered = navigation.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.map(item => ({
        type: 'navigation',
        ...item
      })));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchDropdown(value.length > 0);
    performSearch(value);
  };

  const handleSearchItemClick = (result) => {
    if (result.type === 'navigation') {
      navigate(result.href);
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOrgSwitch = (org) => {
    selectOrganization(org);
    setOrgDropdownOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden lg:flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 shrink-0 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2 rounded-lg shadow-lg">
              <span className="font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ApexBuild
            </span>
          </Link>
        </div>

        {/* Organization Switcher */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {selectedOrganization?.name?.substring(0, 2).toUpperCase() || 'OG'}
              </div>
              <div className="flex flex-col items-start truncate">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                  {selectedOrganization?.name || 'Select Organization'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {(() => {
                    const role = user?.roles?.[0];
                    return (typeof role === 'object' ? role?.roleName : role) || 'Member';
                  })()}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${orgDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Org Dropdown */}
          {orgDropdownOpen && (
            <div className="absolute left-4 w-64 mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Switch Organization
              </div>
              {organizations?.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrgSwitch(org)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedOrganization?.id === org.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedOrganization?.id === org.id ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {org.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate">{org.name}</span>
                  {selectedOrganization?.id === org.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    navigate('/organizations/new');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Organization
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full" />
                )}
                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section (Fixed at bottom) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <img
              src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`}
              alt={user?.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative bg-gray-50 dark:bg-gray-900">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search navigation"
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative">
              <button
                className="relative p-2 text-gray-500 hover:text-indigo-600"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
