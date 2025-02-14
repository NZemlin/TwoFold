import React, { useState, useEffect } from 'react';
import { useInvitationStore } from '../../stores/useInvitationStore';
import { useAuthStore } from '../../stores/useAuthStore';

const InvitePartner: React.FC = () => {
  const [email, setEmail] = useState('');
  const { hasPartner } = useAuthStore();
  const { 
    sendInvitation, 
    cancelInvitation,
    sentInvitations,
    receivedInvitations,
    fetchSentInvitations,
    fetchReceivedInvitations,
    isLoading, 
    error 
  } = useInvitationStore();

  useEffect(() => {
    fetchSentInvitations();
    fetchReceivedInvitations();
  }, [fetchSentInvitations, fetchReceivedInvitations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvitation(email);
    setEmail('');
  };

  const handleCancel = async (invitationId: string) => {
    await cancelInvitation(invitationId);
  };

  const pendingInvitation = sentInvitations.find(inv => inv.status === 'pending');
  const hasPendingReceivedInvitation = receivedInvitations.some(inv => inv.status === 'pending');

  if (hasPartner) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            You're already connected with a partner
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>You can view your shared timeline and start creating memories together.</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingReceivedInvitation) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Pending Invitations
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              You have pending invitations to respond to. Please accept or decline them before sending a new invitation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pendingInvitation) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Pending Invitation
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              You have a pending invitation sent to {pendingInvitation.recipient_email}.
              They'll need to accept it to connect with you.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => handleCancel(pendingInvitation.id)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isLoading ? 'Canceling...' : 'Cancel Invitation'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error instanceof Error ? error.message : error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Invite Your Partner
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Enter your partner's email address to send them an invitation.
            They'll need to create an account to connect with you.
          </p>
        </div>
        <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="email" className="sr-only">
              Partner's Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="partner@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : error}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePartner; 