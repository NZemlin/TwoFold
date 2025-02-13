import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  HeartIcon,
  LightBulbIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

const navigation = [
  { name: 'Timeline', href: '/dashboard', icon: HomeIcon },
  { name: 'Affection', href: '/affection', icon: HeartIcon },
  { name: 'Hints', href: '/hints', icon: LightBulbIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-2xl font-bold text-white">TwoFold</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full text-indigo-100 hover:bg-indigo-600 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <ArrowRightOnRectangleIcon
                  className="text-indigo-300 group-hover:text-white mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                Log Out
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-indigo-700">
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold text-white">TwoFold</span>
          <button
            onClick={handleLogout}
            className="text-indigo-100 hover:bg-indigo-600 p-2 rounded-md"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="px-2 py-2 flex space-x-4 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600'
                } flex flex-col items-center px-2 py-1 text-xs font-medium rounded-md min-w-[4rem]`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-white' : 'text-indigo-300'
                  } h-6 w-6 mb-1`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 