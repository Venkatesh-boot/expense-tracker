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

const ManageGroupMembers: React.FC<ManageGroupMembersProps> = ({ members, onRemove }) => {
  return (
    <ul className="mb-6 divide-y divide-gray-200 dark:divide-gray-700">
      {members.map(member => (
        <li key={member.id} className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
            <div className="text-xs text-gray-500">{member.email}</div>
          </div>
          <button
            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded"
            onClick={() => onRemove(member.id)}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
};

export type { Member };
export default ManageGroupMembers;
