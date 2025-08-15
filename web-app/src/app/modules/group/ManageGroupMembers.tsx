import React from 'react';

type Member = {
  id: string;
  name: string;
  email: string;
};

interface ManageGroupMembersProps {
  members: Member[];
  onRemove: (id: string) => void;
}

const ManageGroupMembers: React.FC<Partial<ManageGroupMembersProps>> = ({ members, onRemove }) => {
  // Use mock data if no members prop is provided
  const displayMembers = members && members.length > 0 ? members : mockGroupMembers;
  const handleRemove = onRemove || (() => {/* intentionally empty fallback */});
  return (
    <ul className="mb-6 divide-y divide-gray-200 dark:divide-gray-700">
      {displayMembers.map(member => (
        <li key={member.id} className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
            <div className="text-xs text-gray-500">{member.email}</div>
          </div>
          <button
            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded"
            onClick={() => handleRemove(member.id)}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
};

export type { Member };

// Mock data for family members invited list
export const mockGroupMembers: Member[] = [
  { id: '1', name: 'Venkatesh', email: 'venkatesh@example.com' },
  { id: '2', name: 'Priya', email: 'priya@example.com' },
  { id: '3', name: 'Arjun', email: 'arjun@example.com' },
];
export default ManageGroupMembers;
