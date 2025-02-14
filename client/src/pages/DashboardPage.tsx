import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import Timeline from '../components/timeline/Timeline';
import InvitePartner from '../components/partner/InvitePartner';
import ReceivedInvitations from '../components/partner/ReceivedInvitations';

const DashboardPage: React.FC = () => {
  const { hasPartner } = useAuthStore();

  return (
    <div>
      {!hasPartner ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Welcome to TwoFold
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              To get started, connect with your partner by sending them an invitation.
            </p>
            <div className="mt-8">
              <InvitePartner />
              <ReceivedInvitations />
            </div>
          </div>
        </div>
      ) : (
        <Timeline />
      )}
    </div>
  );
};

export default DashboardPage; 