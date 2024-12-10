import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-gray-300 bg-white px-4 py-2 text-base font-normal text-gray-700 transition-colors",
          "focus:border-[#58cc02] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-opacity-50",
          "placeholder:text-gray-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "font-nunito",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
