
import React, { useState } from 'react';
import ManageGroupMembers, { Member } from './ManageGroupMembers';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const initialMembers: Member[] = [
  { id: '1', name: 'Alice', email: 'alice@email.com' },
  { id: '2', name: 'Bob', email: 'bob@email.com' },
];

function GroupManagementPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  function handleInvite() {
    if (!inviteEmail || !inviteName) {
      setMessage('Please enter both name and email.');
      return;
    }
    setMembers([...members, { id: Date.now().toString(), name: inviteName, email: inviteEmail }]);
    setMessage(`Invitation sent to ${inviteName} (${inviteEmail})`);
    setInviteEmail('');
    setInviteName('');
  }

  function handleRemove(id: string) {
    setRemoveId(id);
  }

  function confirmRemove() {
    if (removeId) {
      setMembers(members.filter((m: Member) => m.id !== removeId));
      setMessage('Member removed.');
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
          {message && <div className="text-green-600 dark:text-green-300 mt-2">{message}</div>}

          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Group Members</h2>
          <ManageGroupMembers members={members} onRemove={handleRemove} />
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
