import React from 'react';
import { Card } from '@/components/ui/card';

const TeacherCardSkeleton: React.FC = () => {
  return (
    <div className="h-full">
      <Card className="relative overflow-hidden h-full flex flex-col bg-white border-[#2A2624]/10 rounded-2xl">
        {/* Header skeleton */}
        <div className="h-24 bg-[#2A2624]/5 relative animate-pulse" />

        {/* Avatar area */}
        <div className="px-6 -mt-12 mb-4 flex justify-between items-end">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-[#EAE8E4] animate-pulse" />
          <div className="flex gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#2A2624]/5 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-[#2A2624]/5 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow px-6 pb-6">
          {/* Name */}
          <div className="h-6 bg-[#2A2624]/10 rounded w-3/4 mb-2 animate-pulse" />
          
          {/* Location */}
          <div className="h-4 bg-[#2A2624]/5 rounded w-1/3 mb-4 animate-pulse" />

          {/* Specializations */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            <div className="h-5 w-16 bg-[#EAE8E4] rounded animate-pulse" />
            <div className="h-5 w-20 bg-[#EAE8E4] rounded animate-pulse" />
            <div className="h-5 w-14 bg-[#EAE8E4] rounded animate-pulse" />
          </div>
        </div>

        {/* Button */}
        <div className="px-6 pb-6 pt-2">
          <div className="h-9 bg-[#2A2624]/10 rounded animate-pulse w-full" />
        </div>
      </Card>
    </div>
  );
};

export default TeacherCardSkeleton;
