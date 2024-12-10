'use client';

import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UrlInputDialogProps {
  isOpen: boolean;
  onCloseEvent?: string;
  onSubmitEvent?: string;
}

export function UrlInputDialog({ 
  isOpen, 
  onCloseEvent,
  onSubmitEvent = 'SUBMIT_URL'
}: UrlInputDialogProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const submitEvent = new CustomEvent(onSubmitEvent, { 
        detail: { url } 
      });
      window.dispatchEvent(submitEvent);
      setUrl('');
      handleClose();
    } catch (err) {
      setError('Failed to import URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setError('');
    onCloseEvent && window.dispatchEvent(new CustomEvent(onCloseEvent));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-duo-gray">
            Import from URL
          </DialogTitle>
          <DialogDescription className="text-duo-gray-muted">
            Enter the URL of the webpage, blog post, or Notion doc you&apos;d like to import
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://example.com"
              className={`w-full p-3 border-2 ${
                error 
                  ? 'border-duo-error focus:border-duo-error' 
                  : 'border-duo-gray-light focus:border-duo-blue'
              } rounded-lg focus:ring-2 focus:ring-opacity-50 focus:ring-duo-blue focus:outline-none`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url) {
                  void handleSubmit();
                }
              }}
            />
            {error && (
              <p className="text-sm text-duo-error">{error}</p>
            )}
          </div>

          <div className="text-sm text-duo-gray-muted">
            <p className="font-medium mb-2">Supported content types:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-duo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Webpages and articles
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-duo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Blog posts
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-duo" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Public Notion docs
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="primaryOutline"
            onClick={handleClose}
            className="border-2 border-duo-gray-light hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={void handleSubmit}
            disabled={!url || isLoading}
            className="bg-duo hover:bg-duo-hover text-white font-bold min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </div>
            ) : (
              'Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 