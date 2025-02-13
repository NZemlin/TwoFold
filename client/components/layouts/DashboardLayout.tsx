import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { HomeIcon, HeartIcon, GiftIcon, UserIcon } from '@heroicons/react/24/outline';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4">
            <Link to="/dashboard" className="text-2xl font-bold text-primary">
              TwoFold
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg"
            >
              <HomeIcon className="w-5 h-5 mr-3" />
              Timeline
            </Link>
            <Link
              to="/affection"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg"
            >
              <HeartIcon className="w-5 h-5 mr-3" />
              Affection
            </Link>
            <Link
              to="/hints"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg"
            >
              <GiftIcon className="w-5 h-5 mr-3" />
              Hints
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg"
            >
              <UserIcon className="w-5 h-5 mr-3" />
              Profile
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 