'use client';

import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';
import { 
    Users, 
    Calendar, 
    ChevronLeft,
    Building2,
    Shield,
    ExternalLink,
    Clock,
    Activity,
    User as UserIcon,
    Mail,
    GraduationCap,
    MapPin,
    Trash2,
    Settings,
    Tag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CommunityData {
    community: {
        id: string;
        name: string;
        description: string;
        logo_url: string;
        category: string;
        created_at: string;
        follower_count: number;
        event_count: number;
    };
    admin: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string;
        student_id: string;
        department: string;
    };
    events: any[];
}

export default function AdminCommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<CommunityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCommunityDetail = async () => {
        try {
            const res = await fetch(`/api/admin/communities/${id}`);
            if (!res.ok) throw new Error('Topluluk detayları çekilemedi');
            const detailData = await res.json();
            setData(detailData);
        } catch (err: any) {
            toast.error('Topluluk detayları yüklenirken hata oluştu.');
            router.push('/admin/communities');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunityDetail();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Bu topluluğu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        
        try {
            const res = await fetch(`/api/admin/communities`, {
                method: 'DELETE',
                body: JSON.stringify({ id: data?.community.id }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Silme işlemi başarısız');
            
            toast.success('Topluluk başarıyla silindi.');
            router.push('/admin/communities');
        } catch (err) {
            toast.error('Silme işlemi sırasında hata oluştu.');
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="space-y-3 flex-1">
                        <div className="h-6 w-64 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                        <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-800/50 rounded"></div>
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

    const { community, admin, events } = data;
    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.date) >= now);
    const pastEvents = events.filter(e => new Date(e.date) < now);

    return (
        <div className="p-8 max-w-5xl mx-auto pb-32">
            <Link 
                href="/admin/communities" 
                className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white mb-8 transition-colors text-sm font-medium"
            >
                <ChevronLeft size={16} /> Topluluklara Dön
            </Link>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-12">
                <div className="flex gap-6 items-center flex-1">
                    <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-neutral-800 shadow-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 group relative">
                        {community.logo_url ? (
                            <img src={community.logo_url} alt={community.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Building2 size={40} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                            {community.name}
                            <Link href={`/community/${community.id}`} target="_blank" className="text-neutral-400 hover:text-primary transition-colors">
                                <ExternalLink size={18} />
                            </Link>
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary dark:text-primary-300 text-xs font-bold uppercase tracking-wider">
                                <Tag size={12} /> {community.category}
                            </span>
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <Clock size={12} /> Kuruluş: {new Date(community.created_at).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link 
                        href={`/dashboard?communityId=${community.id}`}
                        className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                        <Settings size={16} /> Paneli Yönet
                    </Link>
                    <button 
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Sil
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Takipçi Sayısı</p>
                        <p className="text-2xl font-bold">{community.follower_count}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Toplam Etkinlik</p>
                        <p className="text-2xl font-bold">{community.event_count}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Aktif Etkinlik</p>
                        <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: 상세 Info */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-primary" /> Topluluk Bilgileri
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold uppercase text-neutral-400 mb-2">Açıklama</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                                    "{community.description || 'Açıklama belirtilmedi.'}"
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <UserIcon size={20} className="text-primary" /> Yönetici Bilgisi
                        </h3>
                        <div className="space-y-6">
                            <Link href={`/admin/users/${admin.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                                    {admin.avatar_url ? <img src={admin.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-400"><UserIcon size={24} /></div>}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-neutral-900 dark:text-white truncate">{admin.full_name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{admin.email}</p>
                                </div>
                            </Link>
                            
                            <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-start gap-4">
                                    <GraduationCap size={18} className="text-neutral-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">Bölüm</p>
                                        <p className="text-sm font-medium">{admin.department || 'Belirtilmedi'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Shield size={18} className="text-neutral-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold uppercase text-neutral-400 mb-0.5">Öğrenci No</p>
                                        <p className="text-sm font-medium">{admin.student_id || 'Belirtilmedi'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Events */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Events */}
                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                            <Activity size={20} /> Yaklaşan Etkinlikler
                        </h3>
                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                                <div key={event.id} className="p-4 rounded-xl bg-primary-50/30 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-neutral-900 dark:text-primary-100">{event.title}</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-200 dark:bg-primary-900 text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                                            {event.category}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <Calendar size={14} />
                                            {new Date(event.date).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <MapPin size={14} />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-neutral-500 italic py-4">Yaklaşan etkinlik bulunmuyor.</p>
                            )}
                        </div>
                    </section>

                    {/* Past Events */}
                    <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-neutral-400" /> Etkinlik Geçmişi
                        </h3>
                        <div className="space-y-4">
                            {pastEvents.length > 0 ? pastEvents.map((event) => (
                                <div key={event.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800/50 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                                    <p className="font-bold text-neutral-900 dark:text-neutral-200 mb-1">{event.title}</p>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-neutral-400">
                                        <div className="flex items-center gap-4">
                                            <span>{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                                            <span>•</span>
                                            <span>{event.location}</span>
                                        </div>
                                        <span className="text-neutral-500">{event.category}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-neutral-500 italic py-4">Geçmiş etkinlik bulunmuyor.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
