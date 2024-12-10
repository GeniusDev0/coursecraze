import type { PropsWithChildren } from "react";
import React from "react";

import { AdminMobileHeader } from "@/components/teacher-mobile-header";
import { TeacherSidebar } from "@/components/teacher-mobile-sidebar";

const AdminLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <AdminMobileHeader />
      <TeacherSidebar className="hidden lg:flex" />
      <main className="h-full pt-[50px] lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1056px] pt-6">{children}</div>
      </main>
    </>
  );
};

export default AdminLayout;