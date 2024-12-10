import React, { useState, useEffect } from "react";

import { UserPlus, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  userId: string;
  userName: string;
  userImageSrc: string;
}

interface UserSearchClientProps {
  selectedUsers: string[];
  onUpdateSelectedUsers: (users: string[]) => void;
}

export const UserSearchClient = ({
  selectedUsers,
  onUpdateSelectedUsers,
}: UserSearchClientProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchWords = query.trim().split(/\s+/).filter(word => word.length >= 2);
        const searchString = searchWords.join(' ');
        
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchString)}`);
        if (response.ok) {
          const data = await response.json() as User[];
          setResults(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      void searchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectUser = (userId: string) => {
    onUpdateSelectedUsers([...selectedUsers, userId]);
  };

  const handleRemoveUser = (userId: string) => {
    onUpdateSelectedUsers(selectedUsers.filter(id => id !== userId));
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search for students..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
                <span>{user.userName} ({user.userId.slice(-4)})</span>
              </div>
              {!selectedUsers.includes(user.userId) && (
                <Button
                  onClick={() => handleSelectUser(user.userId)}
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              )}
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
                  <span>{user ? `${user.userName} (${userId.slice(-4)})` : userId}</span>
                  <Button onClick={() => handleRemoveUser(userId)} variant="ghost" size="sm">
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
