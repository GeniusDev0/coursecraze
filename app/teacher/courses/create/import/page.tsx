'use client';

import { useState, useEffect } from "react";

import { PlusIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { BackButton } from "../components/BackButton";
import { ImportOption } from "../components/ImportOption";
import { UrlInputDialog } from "../components/UrlInputDialog";

interface RecentPrompt {
  id: string;
  title: string;
  date: string;
  type: string;
  isDraft?: boolean;
}

interface UrlSubmitEvent extends CustomEvent {
  detail: {
    url: string;
  };
}

export default function ImportPage() {
  const router = useRouter();
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentPrompts] = useState<RecentPrompt[]>(() => {
    const storedPrompts = localStorage.getItem('recentPrompts');
    return storedPrompts ? JSON.parse(storedPrompts) as RecentPrompt[] : [];
  });

  useEffect(() => {
    const handleUrlSubmit = (event: Event) => {
      const customEvent = event as UrlSubmitEvent;
      void (async () => {
        try {
          setIsLoading(true);
          await fetch('/api/import-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: customEvent.detail.url
            })
          });
          router.push('/teacher/courses/edit/new');
        } catch (error) {
          console.error('Error importing URL:', error);
        } finally {
          setIsLoading(false);
        }
      })();
    };

    const handleDialogClose = () => {
      setIsUrlDialogOpen(false);
    };

    // Fixed event listeners
    window.addEventListener('SUBMIT_URL', handleUrlSubmit);
    window.addEventListener('CLOSE_URL_DIALOG', handleDialogClose);

    // Clean up
    return () => {
      window.removeEventListener('SUBMIT_URL', handleUrlSubmit);
      window.removeEventListener('CLOSE_URL_DIALOG', handleDialogClose);
    };
  }, [router]);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      // Simulate file upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Process the file here
      const formData = new FormData();
      formData.append('file', file);

      await new Promise(resolve => setTimeout(resolve, 5000));
      setShowSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/teacher/courses/edit/new');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDriveImport = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/teacher/courses/edit/new');
    } catch (error) {
      console.error('Error importing from Drive:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePrompts = () => {
    // Add logic to load more prompts
    console.log("Loading more prompts...");
  };

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
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col flex-grow">
        <div className="w-full">
          <BackButton />
        </div>
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow">
          <div className="text-center mb-12">
            <h1 className="font-nunito text-4xl font-extrabold text-[#4A7C59] mb-1">
              Import with AI
            </h1>
            <h2 className="text-xl font-nunito font-medium text-[#FFFFFF]">
              Select the file you&apos;d like to transform
            </h2>
          </div>

          {showSuccess && (
            <div className="bg-[#4A7C59]/90 text-white p-4 rounded-lg mb-4 backdrop-blur-sm">
              Success!
            </div>
          )}

          {isLoading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="w-full bg-[#345B63]/20 rounded-full h-2">
                <div 
                  className="bg-[#78C5C2] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[#345B63] mt-2">
                Uploading file... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <ImportOption
              title="Upload a file"
              description={["PowerPoint PPT/X", "Word docs", "PDFs"]}
              imagePath="/upload.svg"
              index={0}
              gradient="linear-gradient(135deg, #CBE7B4 0%, #78C5C2 100%)"
              onClick={() => document.getElementById('fileInput')?.click()}
            />

            <ImportOption
              title="Import from Drive"
              description={["Google Slides", "Google Docs"]}
              imagePath="/google-drive.svg"
              index={1}
              gradient="linear-gradient(135deg, #CBE7B4 0%, #78C5C2 100%)"
              onClick={() => void handleDriveImport()}
            />

            <ImportOption
              title="Import from URL"
              description={["Webpages", "Blog posts", "Notion docs (public)"]}
              imagePath="/webpage.svg"
              index={2}
              badge="Beta"
              onClick={() => setIsUrlDialogOpen(true)}
            />
          </div>

          <p className="text-center text-white mb-8">
            If your file isn&apos;t supported, you can also{" "}
            <Link href="/teacher/courses/create/paste" className="text-[#4A7C59] hover:underline font-medium">
              paste in text
            </Link>
          </p>

          {recentPrompts.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
              <h2 className="font-nunito text-2xl font-bold text-[#4A7C59] mb-6">
                Your recent prompts
              </h2>
              <div className="space-y-3">
                {recentPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    onClick={() => {
                      if (prompt.type === "Text") {
                        localStorage.setItem('coursePrompt', prompt.title);
                      } else {
                        localStorage.setItem('courseFile', prompt.title);
                      }
                      window.location.href = '/teacher/courses/create/generate/outline';
                    }}
                    className="block p-4 border border-[#78C5C2]/30 rounded-lg 
                             hover:bg-white/50 backdrop-blur-sm transition-all duration-300 cursor-pointer"
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
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={loadMorePrompts}
                className="mt-6 w-full text-[#4A7C59] hover:bg-[#78C5C2]/20"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Load more
              </Button>
            </div>
          )}

          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".ppt,.pptx,.doc,.docx,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />

          <UrlInputDialog
            isOpen={isUrlDialogOpen}
            onCloseEvent="CLOSE_URL_DIALOG"
            onSubmitEvent="SUBMIT_URL"
          />
        </div>
      </div>
    </div>
  );
} 