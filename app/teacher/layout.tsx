import type { PropsWithChildren } from "react";
import React from "react";

import { AdminMobileHeader } from "@/components/teacher-mobile-header";
import { TeacherSidebar } from "@/components/teacher-mobile-sidebar";

const TeacherLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-screen w-full">
      <AdminMobileHeader />
      <TeacherSidebar className="hidden lg:flex" />
      <main className="h-full w-full pt-[50px] lg:pl-[256px] lg:pt-0">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;