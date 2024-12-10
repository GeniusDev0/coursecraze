import React from "react";

import { UserPlus, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  userId: string;
  userName: string;
  userImageSrc: string;
}

interface UserSearchResultsProps {
  query: string;
  setQuery: (query: string) => void;
  selectedUsers: string[];
  onUpdateSelectedUsers: (users: string[]) => void;
  results: User[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSelectUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}

export const UserSearchResults = ({
  query,
  setQuery,
  selectedUsers,
  results,
  isLoading,
  onSearch,
  onSelectUser,
  onRemoveUser,
}: UserSearchResultsProps) => {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search for students..."
        value={query}
        onChange={handleQueryChange}
      />
      {isLoading && <p>Loading...</p>}
      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((user) => (
            <li key={user.userId} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image
                  src={user.userImageSrc}
                  alt={user.userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{user.userName}</span>
              </div>
              <Button
                onClick={() => onSelectUser(user.userId)}
                disabled={selectedUsers.includes(user.userId)}
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </li>
          ))}
        </ul>
      )}
      {selectedUsers.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Selected Students:</h3>
          <ul className="space-y-2">
            {selectedUsers.map((userId) => {
              const user = results.find((u) => u.userId === userId);
              return (
                <li key={userId} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{user?.userName || userId}</span>
                  <Button onClick={() => onRemoveUser(userId)} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
