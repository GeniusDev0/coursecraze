"use client";

import { useState } from "react";
import { Challenge, ChallengeOption } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { TextareaAutosize } from "@mui/material";

interface ChallengeItemProps {
  challenge: Challenge & { options: ChallengeOption[] };
}

export const ChallengeItem = ({ challenge }: ChallengeItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [question, setQuestion] = useState(challenge.question);
  const [options, setOptions] = useState(challenge.options);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses/edit/challenge', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          question,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update challenge');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="space-y-4">
          <TextareaAutosize
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            minRows={2}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              borderColor: '#e2e8f0',
              borderWidth: '2px',
              fontFamily: 'inherit',
            }}
          />
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center space-x-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].text = e.target.value;
                  setOptions(newOptions);
                }}
                className="flex-grow p-2 border rounded"
              />
              <input
                type="checkbox"
                checked={option.correct}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index].correct = e.target.checked;
                  setOptions(newOptions);
                }}
              />
              <label>Correct</label>
            </div>
          ))}
          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" onClick={() => setIsEditing(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="font-bold mb-2">{challenge.question}</h3>
          <ul className="list-disc pl-5 mb-2">
            {challenge.options.map((option) => (
              <li key={option.id} className={option.correct ? "font-bold" : ""}>
                {option.text}
              </li>
            ))}
          </ul>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </>
      )}
    </div>
  );
};