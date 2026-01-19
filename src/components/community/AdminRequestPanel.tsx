'use client';

import { useState } from 'react';
import { updateRequestStatus } from '@/app/actions/community-chat';
import { Check, X, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Request {
    id: string;
    user_id: string;
    community_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'used';
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

interface AdminRequestPanelProps {
    requests: Request[];
}

export default function AdminRequestPanel({ requests: initialRequests }: AdminRequestPanelProps) {
    const [requests, setRequests] = useState(initialRequests);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    if (requests.length === 0) return null;

    const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
        setLoadingId(requestId);
        try {
            await updateRequestStatus(requestId, action);
            setRequests(current => current.filter(r => r.id !== requestId));
            toast.success(`İstek ${action === 'approved' ? 'onaylandı' : 'reddedildi'}`);
        } catch (error) {
            console.error(error);
            toast.error('İşlem başarısız oldu');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-500 dark:border-amber-700 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(180,83,9,0.2)]">
            <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300">
                <Bell size={18} />
                <h3 className="font-bold text-sm uppercase tracking-tight">Paylaşım İzin İstekleri</h3>
            </div>

            <div className="space-y-3">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-neutral-900 p-3 border-2 border-amber-200 dark:border-amber-900/50 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(180,83,9,0.1)]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={req.profiles?.avatar_url || '/placeholder-user.jpg'}
                                    alt={req.profiles?.full_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {req.profiles?.full_name}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    Paylaşım izni istiyor
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction(req.id, 'rejected')}
                                disabled={loadingId === req.id}
                                className="p-1.5 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 dark:hover:bg-red-900/20 transition-colors"
                                title="Reddet"
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'approved')}
                                disabled={loadingId === req.id}
                                className="p-1.5 rounded-md hover:bg-green-50 text-green-600 hover:text-green-700 dark:hover:bg-green-900/20 transition-colors"
                                title="Onayla"
                            >
                                <Check size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
