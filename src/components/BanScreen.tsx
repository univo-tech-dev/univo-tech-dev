'use client';

import { LogOut, Ban, Mail } from 'lucide-react';
import { BAN_CATEGORIES } from '@/lib/constants';

interface BanScreenProps {
    banCategory?: string;
    banReason?: string;
    bannedBy?: string;
    onLogout: () => void;
}

export default function BanScreen({ banCategory, banReason, bannedBy, onLogout }: BanScreenProps) {
    const categoryInfo = BAN_CATEGORIES.find(c => c.id === banCategory);

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                {/* Header */}
                <div className="bg-red-600 p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ban size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Hesabınız Askıya Alındı</h1>
                    <p className="text-red-100 text-sm mt-2">Univo platformuna erişiminiz kısıtlanmıştır.</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Ban Category */}
                    {categoryInfo && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="text-xs font-bold uppercase text-red-600 dark:text-red-400 mb-1">Yasaklama Sebebi</div>
                            <div className="text-lg font-bold text-red-700 dark:text-red-300">{categoryInfo.label}</div>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">{categoryInfo.description}</div>
                        </div>
                    )}

                    {/* Admin Note */}
                    {banReason && (
                        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                            <div className="text-xs font-bold uppercase text-neutral-500 mb-1">Yönetici Notu</div>
                            <p className="text-neutral-700 dark:text-neutral-300">{banReason}</p>
                        </div>
                    )}

                    {/* Banned By */}
                    {bannedBy && (
                        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                            İşlemi yapan yönetici: <span className="font-medium">{bannedBy}</span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-4"></div>

                    {/* Appeal Info */}
                    <div className="text-center space-y-3">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Bu kararın hatalı olduğunu düşünüyorsanız, aşağıdaki iletişim kanalları üzerinden itiraz edebilirsiniz.
                        </p>
                        <a 
                            href="mailto:univoksb@gmail.com?subject=Hesap%20Yasağı%20İtirazı"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-sm font-medium"
                        >
                            <Mail size={16} />
                            univoksb@gmail.com
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl hover:opacity-90 transition-all"
                    >
                        <LogOut size={18} />
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
}
