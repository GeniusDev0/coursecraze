"use client";

import { useTransition, useState } from "react";

import { PlusCircle, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Course } from "@/db/schema";

import { Card } from "./card";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";

type ListProps = {
  courses: Course[];
};

export const List = ({ courses: initialCourses }: ListProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteMode, setDeleteMode] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [courses, setCourses] = useState(initialCourses);

  const onClick = (id: number) => {
    if (pending) return;
    startTransition(() => {
      router.push(`/teacher/courses/edit/${id}`);
    });
  };

  const onCreateClick = () => {
    if (pending) return;
    startTransition(() => {
      router.push("/teacher/courses/create");
    });
  };

  const onFindClick = () => {
    if (pending) return;
    startTransition(() => {
      router.push("/teacher/courses/find");
    });
  };

  const handleDeleteClick = (id: number) => {
    setCourseToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      try {
        const response = await fetch(`/api/courses/${courseToDelete}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const deletedCourse = await response.json() as Course;
          setCourses(prevCourses => prevCourses.filter(course => course.id !== deletedCourse.id));
          router.refresh();
        } else {
          const errorText = await response.text();
          alert(`Failed to delete course: ${errorText}. Please try again.`);
        }
      } catch (error) {
        alert(`Error deleting course: ${error instanceof Error ? error.message : String(error)}. Contact help@coursim.co if the problem persists.`);
      }
      setCourseToDelete(null);
      setDeleteMode(false);
    }
  };

  const handleConfirmDeleteWrapper = () => {
    void handleConfirmDelete();
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prevMode) => !prevMode);
  };

  const newAndFindCards = [
    <Card
      key="create"
      id={0}
      title="Create new course"
      imageSrc="/create-course-placeholder.jpg"
      onClick={onCreateClick}
      disabled={pending}
      isActive={false}
    >
      <PlusCircle className="h-10 w-10 text-neutral-500" />
    </Card>,
    <Card
      key="find"
      id={-1}
      title="Find courses"
      imageSrc="/find-course-placeholder.jpg"
      onClick={onFindClick}
      disabled={pending}
      isActive={false}
    >
      <Search className="h-10 w-10 text-neutral-500" />
    </Card>
  ];

  const courseCards = courses.map((course) => (
    <Card
      key={course.id}
      id={course.id}
      title={course.title}
      imageSrc={course.imageSrc}
      onClick={deleteMode ? handleDeleteClick : onClick}
      disabled={pending}
      isActive={false}
      deleteMode={deleteMode}
    />
  ));

  const allCards = [...newAndFindCards, ...courseCards];

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
        <h1 className="text-2xl font-bold text-neutral-700">Your Courses</h1>
        <Button
          onClick={toggleDeleteMode}
          variant={deleteMode ? "danger" : "secondaryOutline"}
        >
          {deleteMode ? "Cancel" : "Delete Courses"}
          <Trash2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
      {rows}
      <DeleteConfirmationModal
        isOpen={courseToDelete !== null}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDeleteWrapper}
      />
    </div>
  );
};
