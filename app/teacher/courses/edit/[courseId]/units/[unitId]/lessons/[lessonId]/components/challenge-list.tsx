"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Challenge, ChallengeOption } from "@/db/schema";

import { ChallengeItem } from "./challenge-item";

interface ChallengeListProps {
  challenges: (Challenge & { options: ChallengeOption[] })[];
  lessonId: number;
}

export const ChallengeList = ({ challenges, lessonId }: ChallengeListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    question: "",
    type: "SELECT",
    option1: "",
    option2: "",
    option3: "",
    answer: "",
  });

  const handleCreateChallenge = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/courses/create/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          question: newChallenge.question,
          type: newChallenge.type,
          order: challenges.length + 1,
          options: newChallenge.type === "SELECT" 
            ? [newChallenge.option1, newChallenge.option2, newChallenge.option3] 
            : [newChallenge.answer],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Challenges</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="primary">
          {showCreateForm ? "Cancel" : "Create Challenge"}
        </Button>
      </div>
      {showCreateForm && (
        <div className="space-y-4">
          {/* Tip: Choose between SELECT (multiple choice) or ASSIST (free text answer) */}
          <Select
            value={newChallenge.type}
            onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
          >
            <option value="SELECT">Select (Multiple Choice)</option>
            <option value="ASSIST">Assist (Free Text)</option>
          </Select>
          {/* Tip: Enter the main question for the challenge */}
          <Input
            placeholder="Enter challenge question"
            value={newChallenge.question}
            onChange={(e) => setNewChallenge({ ...newChallenge, question: e.target.value })}
          />
          {newChallenge.type === "SELECT" ? (
            <>
              {/* Tip: For SELECT type, enter three options for multiple choice */}
              <Input
                placeholder="Enter option 1"
                value={newChallenge.option1}
                onChange={(e) => setNewChallenge({ ...newChallenge, option1: e.target.value })}
              />
              <Input
                placeholder="Enter option 2"
                value={newChallenge.option2}
                onChange={(e) => setNewChallenge({ ...newChallenge, option2: e.target.value })}
              />
              <Input
                placeholder="Enter option 3"
                value={newChallenge.option3}
                onChange={(e) => setNewChallenge({ ...newChallenge, option3: e.target.value })}
              />
            </>
          ) : (
            /* Tip: For ASSIST type, enter the correct answer */
            <Input
              placeholder="Enter correct answer"
              value={newChallenge.answer}
              onChange={(e) => setNewChallenge({ ...newChallenge, answer: e.target.value })}
            />
          )}
          <Button
            onClick={() => void handleCreateChallenge()}
            disabled={isCreating || !newChallenge.question || (newChallenge.type === "SELECT" && (!newChallenge.option1 || !newChallenge.option2 || !newChallenge.option3)) || (newChallenge.type === "ASSIST" && !newChallenge.answer)}
            variant="primary"
            className="w-full"
          >
            {isCreating ? "Creating..." : "Save Challenge"}
          </Button>
        </div>
      )}
      {challenges.map((challenge) => (
        <ChallengeItem key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
};