'use client';

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackButton() {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      className={cn(
        "text-[#1cb0f6]",
        "hover:bg-[#e5e5e5]",
        "mb-6"
      )}
      onClick={() => router.back()}
    >
      <svg className={cn("w-4", "h-4", "mr-2")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </Button>
  );
} 