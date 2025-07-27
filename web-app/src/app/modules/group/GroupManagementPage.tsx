

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { inviteMemberRequest } from '../../store/slices/inviteSlice';
import type { InviteState } from '../../store/slices/inviteSlice';
import { fetchMembersRequest, removeMemberRequest } from '../../store/slices/groupMembersSlice';
import type { GroupMembersState } from '../../store/slices/groupMembersSlice';
import ManageGroupMembers from './ManageGroupMembers';
import Header from '../../components/Header';
import Footer from '../../components/Footer';




function GroupManagementPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const invite = useAppSelector(state => state.invite as InviteState);
  const groupMembers = useAppSelector(state => state.groupMembers as GroupMembersState);

  useEffect(() => {
    dispatch(fetchMembersRequest());
  }, [dispatch]);

  function handleInvite() {
    if (!inviteEmail || !inviteName) {
      return;
    }
    dispatch(inviteMemberRequest({ name: inviteName, email: inviteEmail }));
    setInviteEmail('');
    setInviteName('');
  }

  function handleRemove(id: string) {
    setRemoveId(id);
  }

  function confirmRemove() {
    if (removeId) {
      dispatch(removeMemberRequest({ id: removeId }));
      setRemoveId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 md:px-6">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mt-6 sm:mt-10">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Invite Family Member</h3>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
            />
            <input
              type="email"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
            <button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
              onClick={handleInvite}
              disabled={!inviteEmail || !inviteName}
            >
              Invite
            </button>
          </div>
          {invite.success && (
            <div className="text-green-600 dark:text-green-300 mt-2">
              Invitation sent to {invite.invitedName} ({invite.invitedEmail})
            </div>
          )}
          {invite.error && (
            <div className="text-red-600 dark:text-red-300 mt-2">
              {invite.error}
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Group Members</h2>
          <ManageGroupMembers members={groupMembers.members} onRemove={handleRemove} />
        </div>

        {/* Remove confirmation dialog */}
        {removeId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-xs">
              <div className="mb-4 text-gray-800 dark:text-gray-100 font-semibold">Are you sure you want to remove this member?</div>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" onClick={() => setRemoveId(null)}>Cancel</button>
                <button className="px-4 py-2 rounded bg-red-600 text-white font-semibold" onClick={confirmRemove}>Remove</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default GroupManagementPage;
