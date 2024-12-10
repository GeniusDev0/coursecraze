'use client';

import Image from "next/image";

import { CreateOption } from "./components/CreateOption";

export default function CreatePage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-[#A7D8DE] to-[#D4E8B3] text-[#345B63] p-6">
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <Image 
          src="/create-bg.avif" 
          alt="Background pattern" 
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col flex-grow justify-center">
        <div className="text-center mb-12">
          <h1 className="font-nunito text-4xl font-extrabold text-[#4A7C59] mb-1">
            Create with Coursim
          </h1>
          <h2 className="text-xl font-nunito font-medium text-[#FFFFFF]">
            How would you like to get started?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <CreateOption
            title="Paste Content"
            description="Create from notes, an article, or any existing content"
            imagePath="/paste.svg"
            href="/teacher/courses/create/paste"
            gradient="linear-gradient(135deg, #CBE7B4 0%, #78C5C2 100%)"
            iconColor="#4A7C59"
            badge="Quick, simple, AI powered"
            index={0}
          />
          <CreateOption
            title="Generate Course"
            description="Create from a one-line prompt in a few seconds"
            imagePath="/generate.svg"
            href="/teacher/courses/create/generate"
            gradient="linear-gradient(135deg, #A7D8DE 0%, #78C5C2 100%)"
            iconColor="#345B63"
            badge="AI Powered, In Seconds"
            index={1}
          />
          <CreateOption
            title="Upload Media"
            description="Enhance existing docs, presentations or websites"
            imagePath="/import.svg"
            href="/teacher/courses/create/import"
            gradient="linear-gradient(135deg, #CBE7B4 0%, #78C5C2 100%)"
            iconColor="#4A7C59"
            badge="Enhance Existing Content"
            index={2}
          />
        </div>
      </div>
    </div>
  );
}