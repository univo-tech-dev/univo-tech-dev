import React from 'react';
import SkeletonLoader from '../ui/SkeletonLoader';

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] py-8 px-4">
            {/* Header Skeleton */}
            <div className="max-w-5xl mx-auto mb-8">
                <div className="border-b-4 border-neutral-200 dark:border-neutral-800 pb-4 mb-4 text-center bg-neutral-50 dark:bg-[#0a0a0a] pt-4 px-4 min-h-[200px] flex flex-col justify-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <SkeletonLoader width={350} height={60} className="mb-2" />
                        <SkeletonLoader width={64} height={64} className="rounded-full" />
                    </div>
                    <div className="flex justify-between items-center border-t-2 border-neutral-200 dark:border-neutral-800 pt-2 mt-4 text-neutral-600 dark:text-neutral-400 h-8">
                        <SkeletonLoader width={80} height={20} />
                        <SkeletonLoader width={120} height={20} />
                        <SkeletonLoader width={80} height={20} />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center">
                        <SkeletonLoader width={112} height={112} className="rounded-full mb-4" />
                        <SkeletonLoader width={180} height={28} className="mb-2" />
                        <SkeletonLoader width={220} height={16} className="mb-6" />
                        
                        <div className="flex w-full gap-2 mb-6 border-t border-b border-neutral-100 dark:border-neutral-800 py-3">
                            <div className="flex-1 flex flex-col items-center gap-1">
                                <SkeletonLoader width={20} height={20} />
                                <SkeletonLoader width={50} height={12} />
                            </div>
                            <div className="flex-1 flex flex-col items-center gap-1">
                                <SkeletonLoader width={20} height={20} />
                                <SkeletonLoader width={60} height={12} />
                            </div>
                        </div>
                        <SkeletonLoader width="100%" height={40} className="rounded-lg" />
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio Skeleton */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
                         <SkeletonLoader width={120} height={24} className="mb-4" />
                         <SkeletonLoader width="100%" height={16} className="mb-2" />
                         <SkeletonLoader width="90%" height={16} className="mb-2" />
                         <SkeletonLoader width="70%" height={16} />
                    </div>

                    {/* Badges Skeleton */}
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5].map(i => (
                             <SkeletonLoader key={i} width={64} height={80} className="rounded-lg" />
                        ))}
                    </div>

                    {/* Timeline Skeleton */}
                    <div>
                         <SkeletonLoader width={250} height={32} className="mb-6" />
                         <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4">
                                     <div className="mt-2">
                                        <SkeletonLoader width={12} height={12} className="rounded-full" />
                                     </div>
                                     <div className="flex-1 bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                                         <SkeletonLoader width={150} height={20} className="mb-2" />
                                         <SkeletonLoader width="80%" height={16} />
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

export default ProfileSkeleton;
