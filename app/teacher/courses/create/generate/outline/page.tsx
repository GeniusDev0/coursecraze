'use client';

import { useState, useCallback, useEffect } from "react";

import { RefreshCw, Image as ImageIcon, Sparkles, Globe } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from "swr";

import { BackButton } from "@/components/ui/backbutton";
import { Button } from "@/components/ui/button";


interface Lesson {
  title: string;
  order: number;
}

interface Unit {
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface CourseOutline {
  title: string;
  units: Unit[];
}

interface OutlineData {
  outline: CourseOutline;
  prompt: string;
}

interface GenerateResponse {
  success: boolean;
  outline?: CourseOutline;
  error?: string;
}

interface GenerateSettings {
  prompt: string;
  settings: {
    targetAudience: string;
    imageSource: 'stock' | 'ai' | 'web';
    aiStyle?: string;
    licenseType?: string;
  };
}

interface GenerationProgress {
  progress?: number;
  outline?: CourseOutline;
  error?: string;
}

// Custom fetcher for the course outline
const outlineFetcher = (): OutlineData => {
  const storedOutline = sessionStorage.getItem('courseOutline');
  const storedPrompt = sessionStorage.getItem('coursePrompt');
  
  if (!storedOutline) {
    throw new Error('No course outline found. Please generate one first.');
  }
  
  return {
    outline: JSON.parse(storedOutline) as CourseOutline,
    prompt: storedPrompt || ''
  };
};

interface UseCourseGenerationReturn {
  isGenerating: boolean;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  generateCourse: (settings: GenerateSettings) => Promise<GenerateResponse | null>;
  regenerateOutline: () => Promise<void>;
}

const useCourseGeneration = (outlineData: OutlineData | undefined): UseCourseGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateCourse = useCallback(async (settings: GenerateSettings): Promise<GenerateResponse | null> => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);

      // Include aiStyle in the request body if it exists
      const requestBody = {
        ...settings,
        prompt: settings.settings.imageSource === 'ai' && settings.settings.aiStyle 
          ? `${settings.prompt} (Style: ${settings.settings.aiStyle})`
          : settings.prompt
      };

      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json() as GenerateResponse;
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate course');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const regenerateOutline = useCallback(async (): Promise<void> => {
    if (!outlineData?.prompt) return;

    let eventSource: EventSource | undefined;

    try {
      setIsGenerating(true);
      setErrorMessage(null);

      eventSource = new EventSource(`/api/generate-outline?subject=${encodeURIComponent(outlineData.prompt)}`);
      
      await new Promise<void>((resolve, reject) => {
        if (!eventSource) return reject(new Error('EventSource not initialized'));

        eventSource.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data as string) as GenerationProgress;
            
            if (data.progress !== undefined) {
              // Handle progress updates
              console.log('Generation progress:', data.progress);
            } else if (data.outline) {
              // Handle successful completion
              console.log('New outline received:', data.outline);
              
              // Update the stored outline
              sessionStorage.setItem('courseOutline', JSON.stringify(data.outline));
              sessionStorage.setItem('coursePrompt', outlineData.prompt);
              
              // Trigger revalidation
              void mutate('courseOutline');
              
              // Close the connection and resolve
              eventSource?.close();
              setIsGenerating(false);
              resolve();
            }
          } catch (error) {
            console.error('Error parsing event data:', error);
            eventSource?.close();
            setErrorMessage('Failed to parse server response');
            setIsGenerating(false);
            reject(error);
          }
        };

        eventSource.onerror = (error: Event) => {
          console.error('EventSource error:', error);
          eventSource?.close();
          setErrorMessage('Failed to regenerate outline');
          setIsGenerating(false);
          reject(error);
        };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(message);
      setIsGenerating(false);
    } finally {
      eventSource?.close();
    }
  }, [outlineData?.prompt]);

  return {
    isGenerating,
    errorMessage,
    setErrorMessage,
    generateCourse,
    regenerateOutline
  };
};

export default function OutlinePage() {
  const router = useRouter();
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [imageSource, setImageSource] = useState<'stock' | 'ai' | 'web'>('stock');
  const [aiStyle, setAiStyle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [licenseType, setLicenseType] = useState('Creative Commons');
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: outlineData } = useSWR<OutlineData>('courseOutline', outlineFetcher, {
    onSuccess: () => {
      setTimeout(() => {
        sessionStorage.removeItem('courseOutline');
        sessionStorage.removeItem('coursePrompt');
      }, 1000);
    },
    revalidateOnFocus: false
  });

  useEffect(() => {
    const promptElement = document.querySelector('textarea[placeholder="Your generated prompt..."]') as HTMLTextAreaElement;
    if (!promptElement?.value?.trim()) {
      router.push('/teacher/courses/create/generate');
    }
  }, [router]);

  useEffect(() => {
    if (!outlineData) {
      router.push('/teacher/courses/create/generate');
    } else if (!outlineData.prompt) {
      router.push('/teacher/courses/create/generate');
    }
  }, [outlineData, router]);

  const {
    errorMessage,
    setErrorMessage,
  } = useCourseGeneration(outlineData);
  const handleRegenerateOutline = useCallback(() => {
    if (!outlineData?.prompt) return;

    try {
      setIsGenerating(true);
      setProgress(0);
      setErrorMessage(null);

      const requestBody = {
        subject: outlineData.prompt,
        outline: outlineData.outline,
        settings: {
          targetAudience,
          imageSource,
          ...(imageSource === 'ai' && aiStyle ? { aiStyle } : {}),
          ...(imageSource === 'web' && licenseType ? { licenseType } : {})
        }
      };

      void fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }).then(response => {
        if (!response.body) {
          throw new Error('No response body available');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        const processText = async (reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> => {
          try {
            const { done, value } = await reader.read();
            if (done) return;

            const text = decoder.decode(value);
            const lines = text.split('\n');
            
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6)) as {
                    progress?: number;
                    courseId?: string;
                    error?: string;
                  };

                  if (data.error) {
                    setErrorMessage(data.error);
                    setIsGenerating(false);
                  } else if (data.courseId) {
                    router.push(`/teacher/courses/edit/${data.courseId}`);
                  } else if (data.progress !== undefined) {
                    setProgress(Math.min(data.progress, 100));
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            });

            // Continue reading
            await processText(reader);
          } catch (error) {
            console.error('Error processing text:', error);
            throw error;
          }
        };

        // Start reading
        return processText(reader);
      }).catch(error => {
        console.error('Error in fetch:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
        setIsGenerating(false);
      });
    } catch (error) {
      console.error('Error in handleRegenerateOutline:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
      setIsGenerating(false);
    }
  }, [outlineData, targetAudience, imageSource, aiStyle, licenseType, router, setErrorMessage]);

  // Handle errors and loading states
  if (errorMessage) {
    return <div className="text-red-600">Error: {errorMessage}</div>;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-[#A7D8DE] to-[#D4E8B3] text-[#345B63] p-6">
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <Image src="/create-bg.avif" alt="Background pattern" fill className="object-cover" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <BackButton />

        {/* Prompt Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 mb-8">
          <div className="flex gap-4">
            <textarea
              className="w-full h-14 p-4 border-2 border-[#e5e5e5] rounded-lg 
                       focus:border-[#78C5C2] focus:ring-2 focus:ring-[#78C5C2] 
                       focus:outline-none resize-none bg-white/80"
              value={outlineData?.prompt || ''}
              readOnly
              placeholder="Your generated prompt..."
            />
            <Button
              className="bg-white hover:bg-gray-100 text-[#345B63] p-3 rounded-lg"
              onClick={() => void handleRegenerateOutline()}
              disabled={isGenerating || !outlineData?.prompt}
            >
              <RefreshCw className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Outline Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 mb-8">
          <h2 className="font-nunito text-2xl font-bold text-[#4A7C59] mb-6">Course Outline</h2>
          {isGenerating ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-[#78C5C2]" />
            </div>
          ) : (
            <div className="space-y-4">
              {outlineData?.outline?.units.map((unit, unitIndex) => (
                <div key={unitIndex} className="border border-[#78C5C2]/30 rounded-lg">
                  <button
                    className="w-full p-4 text-left font-medium hover:bg-white/50 transition-all"
                    onClick={() => setExpandedUnit(expandedUnit === unit.order ? null : unit.order)}
                  >
                    Unit {unitIndex + 1}: {unit.title}
                  </button>
                  {expandedUnit === unit.order && (
                    <div className="p-4 pt-0 space-y-2">
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="flex items-center gap-3 p-2 hover:bg-white/50 rounded-lg"
                        >
                          <span
                            className="w-8 h-8 flex items-center justify-center rounded-full 
                                     bg-gradient-to-r from-[#78C5C2] to-[#4A7C59] 
                                     hover:from-[#6AB3B0] hover:to-[#3D6A4A] text-white"
                          >
                            {lessonIndex + 1}
                          </span>
                          <span>{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
          <h2 className="font-nunito text-2xl font-bold text-[#4A7C59] mb-6">Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-[#e5e5e5] rounded-lg"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Beginners, Advanced learners..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image Source</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  className={`flex items-center gap-2 ${
                    imageSource === 'stock' ? 'bg-[#78C5C2]' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setImageSource('stock')}
                >
                  <ImageIcon className="w-4 h-4" /> Stock Photos
                </Button>
                <Button
                  type="button"
                  className={`flex items-center gap-2 ${
                    imageSource === 'ai' ? 'bg-[#78C5C2]' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setImageSource('ai')}
                >
                  <Sparkles className="w-4 h-4" /> AI Images
                </Button>
                <Button
                  type="button"
                  className={`flex items-center gap-2 ${
                    imageSource === 'web' ? 'bg-[#78C5C2]' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setImageSource('web')}
                >
                  <Globe className="w-4 h-4" /> Web Images
                </Button>
              </div>
            </div>

            {imageSource === 'ai' && (
              <div>
                <label className="block text-sm font-medium mb-2">AI Image Style</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-[#e5e5e5] rounded-lg"
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  placeholder="e.g., Minimalistic, Cartoon, Realistic..."
                />
              </div>
            )}

            {imageSource === 'web' && (
              <div>
                <label className="block text-sm font-medium mb-2">License Type</label>
                <select 
                  className="w-full p-3 border-2 border-[#e5e5e5] rounded-lg"
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                >
                  <option>Creative Commons</option>
                  <option>Commercial Use</option>
                  <option>Royalty Free</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Add error message display */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {errorMessage}
          </div>
        )}

          <div className="pt-6">
            <Button 
              className="bg-gradient-to-r from-[#78C5C2] to-[#4A7C59] 
                       hover:from-[#6AB3B0] hover:to-[#3D6A4A] text-white 
                       font-bold py-4 px-10 rounded-xl w-full md:w-auto 
                       transition-all duration-300 text-lg"
              disabled={isGenerating || !outlineData?.prompt}
              onClick={() => void handleRegenerateOutline()}
            >
              {isGenerating ? `Generating... ${progress.toFixed(0)}%` : "Generate"}
            </Button>
            
            {isGenerating && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#78C5C2] h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}