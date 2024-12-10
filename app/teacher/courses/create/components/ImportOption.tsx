'use client';

import { useState } from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";

interface ImportOptionProps {
  title: string;
  description: string[];
  imagePath: string;
  badge?: string;
  gradient?: string;
  iconColor?: string;
  index?: number;
  onClick?: () => void;
}

export function ImportOption({ 
  title, 
  description, 
  imagePath, 
  badge,
  gradient,
  iconColor = '#4A7C59',
  index = 0,
  onClick 
}: ImportOptionProps) {
  const [isHovered, setIsHovered] = useState(false);

  let initialRotation = '0deg';
  let initialTranslateY = '0px';
  if (index === 0) {
    initialRotation = '2deg';
    initialTranslateY = '-8px';
  } else if (index === 2) {
    initialRotation = '-2deg';
    initialTranslateY = '-8px';
  }

  return (
    <Button 
      variant="ghost" 
      className="w-full h-[500px] group transition-all duration-300 hover:shadow-2xl relative overflow-hidden !p-0"
      onClick={onClick}
      style={{
        background: gradient || 'linear-gradient(135deg, #CBE7B4 0%, #78C5C2 100%)',
        borderRadius: '16px',
        transform: isHovered 
          ? 'perspective(1000px) rotate(0deg) translateY(0px) scale(1.05)' 
          : `perspective(1000px) rotate(${initialRotation}) translateY(${initialTranslateY})`,
        transformStyle: 'preserve-3d',
        boxShadow: '0 12px 24px -6px rgba(0,0,0,0.15), 0 8px 16px -6px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="flex flex-col items-center text-center h-full w-full transition-transform duration-300"
        style={{
          transform: 'translateZ(30px)',
        }}
      >
        <div className="relative flex-grow flex items-center justify-center p-6 w-full">
          {badge && (
            <span 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium shadow-md whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: iconColor,
                transform: 'translate3d(-50%, 50%, 40px)',
              }}
            >
              {badge}
            </span>
          )}
          <Image 
            src={imagePath}
            alt={title}
            width={140}
            height={140}
            className="rounded-lg transform transition-transform group-hover:scale-110"
            style={{ color: iconColor }}
          />
        </div>
        <div className="w-full bg-white/90 p-6">
          <div className="w-full">
            <h3 
              className="text-xl font-bold mb-3 font-poppins !break-words !overflow-hidden"
              style={{ 
                color: '#3C3838',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
                whiteSpace: 'normal',
              }}
            >
              {title}
            </h3>
            <div className="space-y-2 mb-4">
              {description.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center text-sm font-nunito"
                  style={{ color: '#736F6F' }}
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="!break-words !overflow-hidden">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Button>
  );
} 