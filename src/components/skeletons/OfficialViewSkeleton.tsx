
import React from 'react';
import { SkeletonLoader } from '../ui/SkeletonLoader';

export const OfficialViewSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 relative animate-in fade-in duration-500">
       {/* Newspaper Header Skeleton */}
       <div className="border-b-4 border-neutral-200 dark:border-neutral-800 pb-4 mb-8 text-center md:static pt-4 -mt-4 -mx-4 px-4 relative">
        <div className="flex flex-col items-center justify-center gap-4">
          <SkeletonLoader width={450} height={60} className="mb-2" />
          <div className="flex items-center gap-3">
             <SkeletonLoader width={56} height={56} className="rounded-full" />
          </div>
        </div>
        <div className="flex justify-between items-center border-t-2 border-neutral-200 dark:border-neutral-800 pt-2 mt-4 max-w-2xl mx-auto">
           <SkeletonLoader width={80} height={20} />
           <SkeletonLoader width={120} height={20} />
           <SkeletonLoader width={80} height={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              {/* Pinned Item */}
              <div className="border-4 border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                  <SkeletonLoader width={120} height={20} className="mb-4 bg-neutral-800 dark:bg-white" />
                  <SkeletonLoader width="80%" height={28} className="mb-3" />
                  <SkeletonLoader width="100%" height={16} className="mb-2" />
                  <SkeletonLoader width="90%" height={16} className="mb-4" />
                  <div className="flex justify-between">
                      <SkeletonLoader width={150} height={16} />
                      <SkeletonLoader width={80} height={16} />
                  </div>
              </div>

               {/* Tabs */}
               <div className="flex gap-4 border-b-2 border-neutral-200 dark:border-neutral-800 mb-6 pb-2 overflow-x-auto">
                   {[1, 2, 3, 4, 5].map(i => (
                       <SkeletonLoader key={i} width={80} height={32} />
                   ))}
               </div>

               {/* List Items */}
               <div className="space-y-4">
                   {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border-l-4 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-sm">
                           <div className="flex-1 space-y-2">
                               <div className="flex justify-between">
                                  <SkeletonLoader width="70%" height={20} />
                                  <SkeletonLoader width={80} height={16} />
                               </div>
                               <SkeletonLoader width="90%" height={16} />
                           </div>
                       </div>
                   ))}
               </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-8 hidden lg:block">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
                  <SkeletonLoader width={180} height={24} className="mb-4" />
                  <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-3">
                              <SkeletonLoader width={40} height={40} className="rounded bg-neutral-200" />
                              <div className="flex-1">
                                  <SkeletonLoader width="80%" height={16} className="mb-1" />
                                  <SkeletonLoader width="50%" height={14} />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
