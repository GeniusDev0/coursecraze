'use client';

import { useState } from "react";

import { PlusIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { BackButton } from "../components/BackButton";

interface RecentPrompt {
  id: string;
  title: string;
  date: string;
  type: string;
  isDraft?: boolean;
}

export default function PastePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>(() => {
    const storedPrompts = localStorage.getItem('recentPrompts');
    return storedPrompts ? JSON.parse(storedPrompts) as RecentPrompt[] : [];
  });

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Add your API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPrompt = { id: Date.now().toString(), title: text, date: new Date().toLocaleString(), type: "Paste" };
      const updatedPrompts = [...recentPrompts, newPrompt];
      localStorage.setItem('recentPrompts', JSON.stringify(updatedPrompts));
      setRecentPrompts(updatedPrompts);
      router.push('/teacher/courses/edit/new');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-[#A7D8DE] to-[#D4E8B3] text-[#345B63] p-6">
      {/* Background image */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <Image 
          src="/create-bg.avif" 
          alt="Background pattern" 
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <BackButton />
        
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 mb-8">
          <h1 className="font-nunito text-3xl font-extrabold text-[#4A7C59] mb-2">
            Paste your content
          </h1>
          <h2 className="text-lg font-nunito font-medium text-[#345B63] mb-6">
            Create your course from existing materials
          </h2>
          
          <textarea
            className="w-full h-48 p-4 border-2 border-[#e5e5e5] rounded-lg 
                     focus:border-[#78C5C2] focus:ring-2 focus:ring-[#78C5C2] 
                     focus:outline-none resize-none bg-white/80"
            placeholder="Paste your content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-[#345B63] text-center mb-8">
            If you already have files, presentations, or webpages, you can{" "}
            <Link href="/teacher/courses/create/import" className="text-[#4A7C59] hover:underline">
              import them here
            </Link>
          </p>
          <Button 
            className="mt-6 bg-gradient-to-r from-[#78C5C2] to-[#4A7C59] 
                     hover:from-[#6AB3B0] hover:to-[#3D6A4A] text-white 
                     font-bold py-3 px-8 rounded-xl w-full md:w-auto"
            disabled={!text || isLoading}
            onClick={() => void handleSubmit()}
          >
            {isLoading ? "Generating..." : "Generate Course"}
          </Button>
        </div>

        {recentPrompts.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
            <h2 className="font-nunito text-2xl font-bold text-[#4A7C59] mb-6">
              Your recent prompts
            </h2>
            <div className="space-y-3">
              {recentPrompts.map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/create/generate/${prompt.id}`}
                  className="block p-4 border border-[#78C5C2]/30 rounded-lg hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-[#345B63]">{prompt.title}</p>
                      <p className="text-sm text-[#345B63]/70">
                        {prompt.type} · {prompt.date}
                        {prompt.isDraft && (
                          <span className="ml-2 px-2 py-1 bg-[#345B63]/10 rounded-full text-xs">
                            Draft
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-[#345B63]/70" />
                  </div>
                </Link>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => console.log("Loading more prompts...")}
              className="mt-6 w-full text-[#4A7C59] hover:bg-[#78C5C2]/20"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}