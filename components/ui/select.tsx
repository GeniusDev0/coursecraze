import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full appearance-none rounded-2xl border-2 border-gray-300 bg-white px-4 py-2 text-base font-normal text-gray-700 transition-colors",
          "focus:border-[#58cc02] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-opacity-50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "font-nunito",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
