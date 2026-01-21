'use client';

import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';
import { 
    User as UserIcon, 
    Mail, 
    GraduationCap, 
    Calendar, 
    Ban, 
    CheckCircle, 
    MessageSquare, 
    Heart, 
    History,
    ChevronLeft,
    Shield,
    ExternalLink,
    Clock,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserData {
    user: any;
    stats: {
        voiceCount: number;
        commentCount: number;
        reactionCount: number;
    };
    recentVoices: any[];
    auditLogs: any[];
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserDetail = async () => {
        try {
            const res = await fetch(`/api/admin/users/${id}`);
            if (!res.ok) throw new Error('Kullanıcı detayları çekilemedi');
            const detailData = await res.json();
            setData(detailData);
        } catch (err: any) {
            toast.error('Kullanıcı detayları yüklenirken hata oluştu.');
            router.push('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetail();
    }, [id]);

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="space-y-3">
                        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                        <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-800/50 rounded"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl"></div>
                    <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl"></div>
                    <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { user, stats, recentVoices, auditLogs } = data;

    return (
        <div className="p-8 max-w-5xl mx-auto pb-32">
            <Link 
                href="/admin" 
                className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white mb-8 transition-colors text-sm font-medium"
            >
                <ChevronLeft size={16} /> Kullanıcılara Dön
            </Link>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-12">
                <div className="flex gap-6 items-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-800 shadow-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <UserIcon size={40} />
                                </div>
                            )}
                        </div>
                        <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white dark:border-neutral-800 flex items-center justify-center ${user.is_banned ? 'bg-red-500' : 'bg-green-500'}`}>
                            {user.is_banned ? <Ban size={10} className="text-white" /> : <CheckCircle size={10} className="text-white" />}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                            {user.full_name}
                            <Link href={`/profile/${user.id}`} target="_blank" className="text-neutral-400 hover:text-primary transition-colors">
                                <ExternalLink size={18} />
                            </Link>
                        </h1>
                        <p className="text-neutral-500 font-medium">@{user.nickname || 'kullanici'}</p>
                        <div className="flex items-center gap-4 mt-2">
                             {user.is_banned && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                                    <Ban size={12} /> Yasaklı
                                </span>
                            )}
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <Clock size={12} /> Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        Mesaj Gönder
                    </button>
                    {!user.is_banned ? (
                        <button className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                            Yasakla
                        </button>
                    ) : (
                        <button className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                            Yasağı Kaldır
                        </button>
                    )}
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Ses Paylaşımı</p>
                        <p className="text-2xl font-bold">{stats.voiceCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Yorum Sayısı</p>
                        <p className="text-2xl font-bold">{stats.commentCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <Heart size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Etkileşim</p>
                        <p className="text-2xl font-bold">{stats.reactionCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Detailed Info */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-primary" /> Bilgiler
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Mail size={18} className="text-neutral-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">E-Posta</p>
                                    <p className="text-sm font-medium">{user.email || 'Belirtilmedi'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <GraduationCap size={18} className="text-neutral-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">Bölüm & Sınıf</p>
                                    <p className="text-sm font-medium">{user.department} {user.class_year ? `• ${user.class_year}. Sınıf` : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Shield size={18} className="text-neutral-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">Öğrenci Numarası</p>
                                    <p className="text-sm font-medium">{user.student_id || 'Belirtilmedi'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Shield size={18} className="text-neutral-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">Üniversite</p>
                                    <p className="text-sm font-medium">
                                        {user.university === 'bilkent' ? 'Bilkent Üniversitesi' : user.university === 'cankaya' ? 'Çankaya Üniversitesi' : (user.university === 'metu' || !user.university) ? 'Orta Doğu Teknik Üniversitesi' : user.university}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Clock size={18} className="text-neutral-400 mt-1" />
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">Son Giriş</p>
                                    <p className="text-sm font-medium">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
                                </div>
                            </div>
                        </div>

                        {user.bio && (
                            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <p className="text-xs font-bold uppercase text-neutral-400 mb-3">Biyografi</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                                    "{user.bio}"
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Ban Info if applicable */}
                    {user.is_banned && (
                        <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/50 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <Ban size={20} /> Yasak Detayları
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-red-500 mb-1">Kategori</p>
                                    <p className="text-sm font-medium">{user.ban_category || 'Belirtilmedi'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-red-500 mb-1">Sebep</p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{user.ban_reason}</p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-red-500">Yasaklayan Admin: <span className="font-bold">{user.banned_by || 'Sistem'}</span></p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: Activity & Logs */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Voices */}
                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <MessageSquare size={20} className="text-primary" /> Son Paylaşımlar
                        </h3>
                        <div className="space-y-4">
                            {recentVoices.length > 0 ? recentVoices.map((voice) => (
                                <div key={voice.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800/50">
                                    <p className="text-sm text-neutral-900 dark:text-neutral-200 mb-2 line-clamp-2">{voice.content}</p>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-neutral-400">
                                        <span>{new Date(voice.created_at).toLocaleString('tr-TR')}</span>
                                        <div className="flex items-center gap-2">
                                            {voice.is_anonymous && <span className="text-neutral-500">ANONİM</span>}
                                            <Link href="/admin/voices" className="text-blue-500 hover:underline">Görüntüle</Link>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-neutral-500 italic py-4">Henüz paylaşım yapılmamış.</p>
                            )}
                        </div>
                    </section>

                    {/* Audit Logs */}
                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <History size={20} className="text-primary" /> Admin Geçmişi
                        </h3>
                        <div className="space-y-3">
                            {auditLogs.length > 0 ? auditLogs.map((log) => (
                                <div key={log.id} className="flex gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                                        log.action.includes('BAN') ? 'bg-red-500' : 'bg-blue-500'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{log.details}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                            <span>{log.admin_name}</span>
                                            <span>•</span>
                                            <span>{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-neutral-500 italic py-4">Bu kullanıcı için henüz bir işlem logu yok.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
