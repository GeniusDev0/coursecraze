import { useState } from 'react';

import { UserSearchClient } from './user-search-client';

interface UserSearchWrapperProps {
  onUpdateSelectedUsers: (users: string[]) => void;
}

export const UserSearchWrapper = ({ onUpdateSelectedUsers }: UserSearchWrapperProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleUpdateSelectedUsers = (users: string[]) => {
    setSelectedUsers(users);
    onUpdateSelectedUsers(users);
  };

  return (
    <UserSearchClient
      selectedUsers={selectedUsers}
      onUpdateSelectedUsers={handleUpdateSelectedUsers}
    />
  );
};
