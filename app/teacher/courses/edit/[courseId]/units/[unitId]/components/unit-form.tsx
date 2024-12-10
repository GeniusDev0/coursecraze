"use client";

import { useState } from "react";

import { TextareaAutosize } from "@mui/material";

import { Button } from "@/components/ui/button";
import { Unit } from "@/db/schema";

type UnitFormProps = {
  unit: Unit;
  courseId: number;
};

export const UnitForm = ({ unit, courseId }: UnitFormProps) => {
  const [title, setTitle] = useState(unit.title);
  const [description, setDescription] = useState(unit.description);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/courses/edit/unit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unitId: unit.id,
          courseId,
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update unit");
      }

      setMessage({ text: "Unit updated successfully", type: 'success' });
    } catch (error) {
      setMessage({ text: "Failed to update unit", type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
      {message && (
        <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <TextareaAutosize
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minRows={1}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            borderColor: '#e2e8f0',
            borderWidth: '2px',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <TextareaAutosize
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minRows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            borderColor: '#e2e8f0',
            borderWidth: '2px',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Unit"}
      </Button>
    </form>
  );
};