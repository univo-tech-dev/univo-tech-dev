'use client';

import { useEffect, useState } from 'react';
import { Ban, CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    full_name: string;
    student_id: string;
    department: string;
    is_banned: boolean;
    ban_reason?: string;
    banned_by?: string;
    email?: string;
}

export default function BannedUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchBannedUsers = async () => {
        try {
            const res = await fetch('/api/admin/banned');
            if (!res.ok) throw new Error('Veri çekilemedi');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            toast.error('Yasaklı kullanıcılar yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBannedUsers();
    }, []);

    const handleUnban = async (userId: string) => {
        if (!confirm('Kullanıcının yasağını kaldırmak istediğinize emin misiniz?')) return;

        try {
            const res = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_ban', userId, isBanned: false })
            });

            if (!res.ok) throw new Error('İşlem başarısız');

            toast.success('Kullanıcı yasağı kaldırıldı.');
            fetchBannedUsers(); // Refresh list
        } catch (err) {
            toast.error('İşlem sırasında hata oluştu.');
        }
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.student_id?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="space-y-4">
                    <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                    <div className="h-4 w-64 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg"></div>
                </div>
                
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 h-16 animate-pulse"></div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="p-6 bg-white dark:bg-neutral-800 h-16 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-neutral-900 dark:text-white">
                    <Ban className="text-red-600" /> Yasaklı Kullanıcılar
                </h1>
                <p className="text-neutral-500 mt-2">Platformdan uzaklaştırılan kullanıcıların listesi</p>
            </header>

            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4">
                    <h2 className="font-bold text-lg">Tüm Yasaklılar</h2>
                    <div className="relative w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Kullanıcı ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-medium border-b border-neutral-200 dark:border-neutral-700">
                        <tr>
                            <th className="px-6 py-3">Kullanıcı</th>
                            <th className="px-6 py-3">Yasaklanma Sebebi</th>
                            <th className="px-6 py-3">Yasaklayan</th>
                            <th className="px-6 py-3 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 italic">
                                    {search ? 'Aramanızla eşleşen kullanıcı bulunamadı.' : 'Henüz yasaklı kullanıcı yok.'}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900 dark:text-white">{user.full_name}</div>
                                        <div className="text-xs text-neutral-500">{user.student_id || user.email || 'ID Yok'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-red-600 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-xs">
                                            {user.ban_reason || 'Sebep belirtilmemiş'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                        {user.banned_by || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleUnban(user.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors"
                                        >
                                            <CheckCircle size={14} className="text-green-600" /> Yasağı Kaldır
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
