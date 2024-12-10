'use client';

import { useState, useCallback, useEffect } from "react";

import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';


import { Button } from "@/components/ui/button";

import { BackButton } from "../components/BackButton";

interface RecentPrompt {
  id: string;
  title: string;
  date: string;
  type: string;
  isDraft?: boolean;
}

interface GenerateResponse {
  progress?: number;
  outline?: unknown;
  error?: string;
  success?: boolean;
}


export default function GeneratePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPrompts = localStorage.getItem('recentPrompts');
      if (storedPrompts) {
        setRecentPrompts(JSON.parse(storedPrompts) as RecentPrompt[]);
      }
    }
  }, []);

  const handleGenerate = useCallback(() => {

    const generate = () => {
      let eventSource: EventSource | null = null;

      try {
        console.log('[handleGenerate] Starting generation with prompt:', prompt);
        setIsLoading(true);
        setProgress(0);
        setError(null);

        eventSource = new EventSource(`/api/generate-outline?subject=${encodeURIComponent(prompt)}`);
        console.log('[handleGenerate] Created EventSource');

        eventSource.addEventListener('message', (event) => {
          console.log('[handleGenerate] Raw message data:', event.data);

          try {
            const data = JSON.parse(event.data as string) as GenerateResponse;
            console.log('[handleGenerate] Parsed data:', data);

            if (data.progress !== undefined) {
              console.log('[handleGenerate] Progress update:', data.progress);
              setProgress(Math.min(data.progress, 100));
            }

            if (data.success && data.outline) {
              console.log('[handleGenerate] Received successful outline:', data.outline);
              sessionStorage.setItem('courseOutline', JSON.stringify(data.outline));
              sessionStorage.setItem('coursePrompt', prompt);

              setTimeout(() => {
                if (eventSource) {
                  eventSource.close();
                  console.log('[handleGenerate] EventSource closed after successful completion');
                }
                router.push('/teacher/courses/create/generate/outline');
                setIsLoading(false);
              }, 500);

              const newPrompt = {
                id: Date.now().toString(),
                title: prompt,
                date: new Date().toLocaleString(),
                type: "Generate"
              };
              const updatedPrompts = [...recentPrompts, newPrompt];
              localStorage.setItem('recentPrompts', JSON.stringify(updatedPrompts));
              setRecentPrompts(updatedPrompts);
            }

            if (data.error) {
              console.error('[handleGenerate] Received error:', data.error);
              setError(data.error);
              if (eventSource) {
                eventSource.close();
              }
              setIsLoading(false);
            }
          } catch (parseError) {
            console.error('[handleGenerate] Error parsing message:', parseError);
            setError('Failed to parse server response');
            if (eventSource) {
              eventSource.close();
            }
            setIsLoading(false);
          }
        });

        eventSource.addEventListener('error', (error) => {
          console.error('[handleGenerate] EventSource error:', error);
          if (eventSource) {
            eventSource.close();
          }
          setIsLoading(false);
        });

      } catch (error) {
        console.error('[handleGenerate] Error:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        if (eventSource) {
          eventSource.close();
        }
        setIsLoading(false);
      }
    };

    generate();
  }, [prompt, recentPrompts, router]);

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

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <BackButton />

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 mb-8">
          <h1 className="font-nunito text-3xl font-extrabold text-[#4A7C59] mb-2">
            Generate a Coursim
          </h1>
          <h2 className="text-lg font-nunito font-medium text-[#345B63] mb-6">
            Create your multi-lesson course in seconds
          </h2>
          
          <textarea
            className="w-full h-32 p-4 border-2 border-[#e5e5e5] rounded-lg 
                     focus:border-[#78C5C2] focus:ring-2 focus:ring-[#78C5C2] 
                     focus:outline-none resize-none mb-4 bg-white/80"
            placeholder="Describe what you'd like to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex flex-col">
            <Button 
              className="bg-gradient-to-r from-[#78C5C2] to-[#4A7C59] 
                       hover:from-[#6AB3B0] hover:to-[#3D6A4A] text-white 
                       font-bold py-3 px-8 rounded-xl w-full md:w-auto 
                       transition-all duration-300"
              disabled={!prompt || isLoading}
              onClick={handleGenerate}
            >
              {isLoading ? `Generating... ${progress.toFixed(0)}%` : "Generate"}
            </Button>
            
            {isLoading && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#78C5C2] h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>

        {recentPrompts.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
            <h2 className="font-nunito text-2xl font-bold text-[#4A7C59] mb-6">
              Your recent prompts
            </h2>
            <div className="space-y-3">
              {[...recentPrompts].reverse().map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/teacher/courses/create/generate/outline/${prompt.id}`}
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
          </div>
        )}
      </div>
    </div>
  );
}