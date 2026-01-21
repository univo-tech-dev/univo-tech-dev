'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { Community } from '@/types';

interface CommunityCardProps {
    community: Community & {
        logo_url?: string;
        admin_id?: string;
        profiles?: {
            university?: string;
        };
    };
}

export default function CommunityCard({ community }: CommunityCardProps) {
    const router = useRouter();

    return (
        <motion.div
            onClick={() => router.push(`/community/${community.id}`)}
            className="block h-full group relative cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="h-full flex flex-col bg-neutral-50 dark:bg-[#0a0a0a] border-4 border-black dark:border-neutral-600 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                {/* Header / Category */}
                <div className="border-b-4 border-black dark:border-neutral-600 p-3 flex justify-between items-center bg-white dark:bg-neutral-900 transition-colors">
                    <span className="font-black font-serif uppercase text-sm tracking-wide" style={{ color: 'var(--primary-color, #C8102E)' }}>
                        {community.category || 'Genel'}
                    </span>
                    {community.profiles?.university && (
                        <span className="text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700">
                            {community.profiles.university === 'bilkent' ? 'Bilkent' : 'ODTÜ'}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-4 rounded-full border-4 border-black dark:border-neutral-600 overflow-hidden bg-white relative">
                        {community.logo_url ? (
                            <img src={community.logo_url} alt={community.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-3xl font-black text-neutral-400">
                                {community.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-black font-serif text-black dark:text-white mb-2 leading-tight group-hover:underline decoration-2 underline-offset-2">
                        {community.name}
                    </h3>

                    <div className="mt-auto pt-6 w-full flex justify-between items-center">
                        <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all mx-auto dark:text-white">
                            Profili İncele
                            <ArrowRight size={16} />
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
