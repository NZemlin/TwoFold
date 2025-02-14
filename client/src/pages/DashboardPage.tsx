import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import InvitePartner from '../components/partner/InvitePartner';
import ReceivedInvitations from '../components/partner/ReceivedInvitations';

const DashboardPage: React.FC = () => {
  const { hasPartner } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* Show received invitations first */}
        <div className="mt-6">
          <ReceivedInvitations />
        </div>

        {/* Show invite partner section if not connected */}
        {!hasPartner && (
          <div className="mt-6">
            <InvitePartner />
          </div>
        )}

        {/* Timeline content will go here once connected */}
        {hasPartner && (
          <div className="mt-6">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Your Timeline
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Start creating memories with your partner! Add photos, notes, and special moments to your shared timeline.
                  </p>
                </div>
                {/* Timeline components will be added here later */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 