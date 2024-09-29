import Image from "next/image";

import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <div className="hidden h-20 w-full border-t-2 border-slate-200 p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/math.png"
            alt="Math"
            height={40}
            width={40}
            className="mr-4 rounded-md"
          />
          Math
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/science.png"
            alt="Science"
            height={40}
            width={40}
            className="mr-4 rounded-md"
          />
          Science
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/cs.png"
            alt="Computer Science"
            height={40}
            width={40}
            className="mr-4 rounded-md"
          />
          Computer Science
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/history.png"
            alt="History"
            height={40}
            width={40}
            className="mr-4 rounded-md"
          />
          History
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/geography.png"
            alt="Geography"
            height={40}
            width={40}
            className="mr-4 rounded-md"
          />
          Literature
        </Button>
      </div>
    </div>
  );
};
