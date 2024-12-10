import { TeacherSidebar } from "./teacher-mobile-sidebar";

export const AdminMobileHeader = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center border-b bg-blue-600 px-4 lg:hidden">
      <TeacherSidebar />
    </nav>
  );
};