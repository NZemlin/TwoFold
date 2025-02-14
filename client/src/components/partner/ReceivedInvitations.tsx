import React, { useEffect } from 'react';
import { useInvitationStore } from '../../stores/useInvitationStore';
import { useAuthStore } from '../../stores/useAuthStore';

const ReceivedInvitations: React.FC = () => {
  const { hasPartner } = useAuthStore();
  const {
    receivedInvitations,
    fetchReceivedInvitations,
    acceptInvitation,
    rejectInvitation,
    isLoading,
    error
  } = useInvitationStore();

  useEffect(() => {
    fetchReceivedInvitations();
  }, [fetchReceivedInvitations]);

  if (hasPartner || !receivedInvitations.length) {
    return null;
  }

  const pendingInvitations = receivedInvitations.filter(inv => inv.status === 'pending');

  if (!pendingInvitations.length) {
    return null;
  }

  return (
    <div className="bg-white shadow sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Partner Invitations
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>You have received the following partner invitations:</p>
        </div>
        <div className="mt-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600">
              {error instanceof Error ? error.message : error}
            </div>
          )}
          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="border border-gray-200 rounded-md p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    From: {invitation.senderEmail}
                  </p>
                  <p className="text-sm text-gray-500">
                    Sent: {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => rejectInvitation(invitation.id)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => acceptInvitation(invitation.id)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceivedInvitations; 