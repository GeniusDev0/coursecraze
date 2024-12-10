import { ClerkLoading, ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

type TeacherSidebarProps = {
  className?: string;
};

export const TeacherSidebar = ({ className }: TeacherSidebarProps) => {
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 px-4 lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href="/teacher/courses">
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/mascot.png" alt="Teacher Logo" height={40} width={40} />
          <h1 className="text-2xl font-extrabold tracking-wide text-[#58CC02]">
            Coursim
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Courses" href="/teacher/courses" iconSrc="/courses.png" />
        <SidebarItem label="Classes" href="/teacher/classes" iconSrc="/classes.png" />
        <SidebarItem label="Analytics" href="/teacher/analytics" iconSrc="/analytics.png" />
        <SidebarItem label="Resources" href="/teacher/resources" iconSrc="/resources.png" />
      </div>

      <div className="p-4">
        <ClerkLoading>
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </ClerkLoading>

        <ClerkLoaded>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { userButtonPopoverCard: { pointerEvents: "initial" } },
            }}
          />
        </ClerkLoaded>
      </div>
    </div>
  );
};