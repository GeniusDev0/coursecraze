"use client";

import { useState } from "react";

import { TextareaAutosize } from "@mui/material";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Class, UserProgress } from "@/db/schema";

// Add this interface to define the shape of the API response
interface UpdatedClassResponse {
  name: string;
  imageSrc: string;
}

type ClassEditSidebarProps = {
  classDetails: Class;
  teacherProgress: UserProgress;
};

export const ClassEditSidebar = ({ classDetails }: ClassEditSidebarProps) => {
  const router = useRouter();
  const [name, setName] = useState(classDetails.name);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState(classDetails.imageSrc);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/classes/${classDetails.id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update class");
      }

      const updatedClass = await response.json() as UpdatedClassResponse;
      setName(updatedClass.name);
      
      // Update imagePreview with the new image URL from the server
      // but only if we actually sent a new image
      if (imageBase64) {
        setImagePreview(updatedClass.imageSrc);
      }
      // Don't reset imageBase64 to null here

      setMessage({ text: "Class updated successfully", type: 'success' });
      
      // Update the router cache without triggering a full page reload
      router.refresh();
    } catch (error) {
      setMessage({ text: "Failed to update class", type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {message && (
        <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <Image
            src={imageBase64 ? imageBase64 : imagePreview}
            alt="Class image"
            width={128}
            height={128}
            className="rounded-full object-cover"
          />
          <label htmlFor="image-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer">
            <Upload className="h-5 w-5 text-gray-600" />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Class Name
        </label>
        <TextareaAutosize
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minRows={1}
          className="w-full p-2 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
      >
        {isLoading ? "Updating..." : "Update Class"}
      </Button>
    </form>
  );
};
