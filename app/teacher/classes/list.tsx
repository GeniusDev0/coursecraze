"use client";

import { useTransition, useState } from "react";

import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Class } from "@/db/schema";

import { Card } from "./card";

type ListProps = {
  classes: Class[];
};

export const List = ({ classes: initialClasses }: ListProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteMode, setDeleteMode] = useState(false);
  const [classes, setClasses] = useState(initialClasses);

  const onClick = (id: number) => {
    if (pending) return;
    startTransition(() => {
      router.push(`/teacher/classes/${id}`);
    });
  };

  const onCreateClick = () => {
    if (pending) return;
    startTransition(() => {
      router.push("/teacher/classes/create");
    });
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      await handleConfirmDelete(id);
    }
  };

  const handleConfirmDelete = async (classId: number) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const deletedClass = await response.json() as Class;
        setClasses(prevClasses => prevClasses.filter(cls => cls.id !== deletedClass.id));
        router.refresh();
      } else {
        const errorText = await response.text();
        alert(`Failed to delete class: ${errorText}. Please try again.`);
      }
    } catch (error) {
      alert(`Error deleting class: ${error instanceof Error ? error.message : String(error)}. Contact hel@coursim.co if the problem persists.`);
    }
    setDeleteMode(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prevMode) => !prevMode);
  };

  const newClassCard = (
    <Card
      key="create"
      id={0}
      title="Create new class"
      imageSrc="/create-class-placeholder.jpg"
      onClick={onCreateClick}
      disabled={pending}
      isActive={false}
    >
      <PlusCircle className="h-10 w-10 text-neutral-500" />
    </Card>
  );

  const classCards = classes.map((cls) => (
    <Card
      key={cls.id}
      id={cls.id}
      title={cls.name}
      imageSrc={cls.imageSrc}
      onClick={deleteMode ? handleDeleteClick : onClick}
      disabled={pending}
      isActive={false}
      deleteMode={deleteMode}
    />
  ));

  const allCards = [newClassCard, ...classCards];

  const rows = [];
  for (let i = 0; i < allCards.length; i += 5) {
    rows.push(
      <div key={i} className="flex gap-4 mb-4 justify-start">
        {allCards.slice(i, i + 5)}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-neutral-700">Your Classes</h1>
        <Button
          onClick={toggleDeleteMode}
          variant={deleteMode ? "danger" : "secondaryOutline"}
        >
          {deleteMode ? "Cancel" : "Delete Classes"}
          <Trash2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {rows}
    </div>
  );
};
