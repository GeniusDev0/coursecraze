"use client";

import { useEffect, useState } from "react";

import { ClerkLoaded, ClerkLoading, SignedIn, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/backbutton";
import { Button } from "@/components/ui/button";

export default function RolesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingRole = async () => {
      try {
        const response = await fetch("/api/get-user-role");
        if (response.ok) {
          const { role } = await response.json() as { role: string };
          if (role === "STUDENT") {
            router.push("/learn");
          } else if (role === "TEACHER") {
            router.push("/teacher/courses");
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    if (user) {
      void checkExistingRole();
    }
  }, [user, router]);

  const handleRoleSelection = async (role: "STUDENT" | "TEACHER") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/set-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to set user role");
      }

      if (role === "STUDENT") {
        router.push("/courses");
      } else {
        router.push("/teacher/courses");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-2 p-4 lg:flex-row min-h-screen">
      <BackButton />
      <div className="flex flex-col items-center gap-y-8">
        <div className="relative mb-8 h-[240px] w-[240px] lg:mb-0 lg:h-[424px] lg:w-[424px]">
          <Image src="/hero.svg" alt="Hero" fill />
        </div>

        <h1 className="max-w-[480px] text-center text-xl font-bold text-neutral-600 lg:text-3xl">
          Choose your role in Coursim
        </h1>

        <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>

          <ClerkLoaded>
            <SignedIn>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => void handleRoleSelection("STUDENT")}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Continue as Student"}
              </Button>
              <Button
                size="lg"
                variant="primaryOutline"
                className="w-full"
                onClick={() => void handleRoleSelection("TEACHER")}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Continue as Teacher"}
              </Button>
              {error && <span className="text-red-500 mt-2">{error}</span>}
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}
