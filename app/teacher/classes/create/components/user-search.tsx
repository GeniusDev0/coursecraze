"use client";

import { useState, useEffect } from "react";

import { X } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";

interface User {
  userId: string;
  userName: string;
  userImageSrc: string;
  email: string;
}

export const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim() === "") {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json() as User[];
          // Filter out already selected users
          const filteredUsers = data.filter((user) => 
            !selectedUsers.some(selectedUser => selectedUser.userId === user.userId)
          );
          setUsers(filteredUsers);
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
  }, [query, selectedUsers]);

  const addUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setUsers(prev => prev.filter(u => u.userId !== user.userId));
    setQuery("");
  };

  const removeUser = (user: User) => {
    setSelectedUsers(prev => prev.filter(u => u.userId !== user.userId));
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Search for students..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />
      {selectedUsers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Selected Students:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div key={user.userId} className="flex items-center bg-gray-100 rounded-full pl-1 pr-2 py-1">
                <Image
                  src={user.userImageSrc}
                  alt={user.userName}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <span className="text-sm">{user.userName} ({user.email})</span>
                <button onClick={() => removeUser(user)} className="ml-2 text-gray-500 hover:text-gray-700">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {isLoading && <p>Loading...</p>}
      {!isLoading && users.length > 0 && (
        <ul className="space-y-2">
          {users.map((user) => (
            <li 
              key={user.userId} 
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => addUser(user)}
            >
              <Image
                src={user.userImageSrc}
                alt={user.userName}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>{user.userName} ({user.email})</span>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && query && users.length === 0 && (
        <p>No users found</p>
      )}
    </div>
  );
};
