'use client';

import React, { useState, useRef } from 'react';

import { useAuth } from "@clerk/nextjs";
import { TextField, Switch, FormControlLabel, LinearProgress, styled, linearProgressClasses } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios, { AxiosError } from 'axios';
import { Sparkles, Upload } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button"


const theme = createTheme({
  typography: {
    fontFamily: '__Nunito_14f33d, __Nunito_Fallback_14f33d',
  },
});

const DuolingoProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 10,
    backgroundColor: '#58CC02',
  },
}));

const Prompt = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const { userId } = useAuth();
  const [progressMessage, setProgressMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setProgressMessage('Initializing...');

    try {
      const response = await axios.post('/api/generate-course', {
        subject: prompt,
        isPublic,
        teacherId: userId,
        imageSrc: coverImage
      }, {
        responseType: 'text'
      });

      const lines = (response.data as string).split('\n');
      let courseId: string | null = null;

      for (const line of lines) {
        if (typeof line === 'string' && line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6)) as { progress?: number; courseId?: string; error?: string };
          if ('progress' in data && typeof data.progress === 'number') {
            setProgress(data.progress);
            setProgressMessage(getProgressMessage(data.progress));
          } else if ('courseId' in data && typeof data.courseId === 'string') {
            courseId = data.courseId;
            setProgress(100);
            setProgressMessage('Course generated successfully!');
          } else if ('error' in data && typeof data.error === 'string') {
            throw new Error(data.error);
          }
        }
      }

      if (courseId) {
        router.push(`/teacher/courses/edit/${courseId}`);
      } else {
        throw new Error('Course ID not received');
      }
    } catch (error) {
      console.error('Error generating course:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        const errorMessage = axiosError.response?.data?.error || axiosError.message;
        alert(`Error: ${errorMessage}`);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressMessage = (progress: number): string => {
    if (progress < 10) return 'Generating course structure...';
    if (progress < 70) return 'Creating units and lessons...';
    if (progress < 95) return 'Generating challenges...';
    return 'Finalizing course...';
  };

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post<{ success: boolean; data: { url: string } }>('https://api.imgbb.com/1/upload', formData, {
        params: {
          key: process.env.NEXT_PUBLIC_IMGBB_API_KEY,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setCoverImage(response.data.data.url);
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleImageUpload(file);
    }
  };

  const handleUploadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    fileInputRef.current?.click();
  };
  
  return (
    <ThemeProvider theme={theme}>
      <div className="w-full mt-8">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6 border-2 border-slate-200">
          <form onSubmit={onSubmit} className="space-y-4">
            <TextField
              multiline
              rows={6}
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Create a beginner-level Spanish course for English speakers, focusing on essential vocabulary and basic grammar. Include units on greetings, numbers, and common phrases."
              disabled={isLoading}
              variant="outlined"
              InputProps={{
                style: { fontFamily: 'inherit' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#58CC02',
                    borderWidth: '2px',
                  },
                },
              }}
            />
            <div className="mb-4">
              <label htmlFor="cover-image" className="block text-lg font-bold text-gray-700 mb-2">
                Upload Cover Image
              </label>
              <input
                ref={fileInputRef}
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleUploadClick}
                type="button"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
            {coverImage && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={coverImage}
                  alt="Cover preview"
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <span className="font-bold font-sans transition-opacity duration-300 opacity-100">
                    Make course public
                  </span>
                }
              />
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Course
                  </>
                )}
              </Button>
            </div>
            
            {isLoading && (
              <div className="mt-4">
                <DuolingoProgressBar variant="determinate" value={progress} />
                <p className="text-center mt-2 font-bold text-green-500">{progressMessage}</p>
                <p className="text-center text-sm text-gray-500">{progress}% Complete</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Prompt;
