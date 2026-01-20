'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Search, Trash2, Users, Calendar, ArrowRight, Settings, Plus, Building2, Filter, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { COMMUNITY_CATEGORIES } from '@/lib/constants';

interface Community {
    id: string;
    name: string;
    logo_url: string;
    category: string;
    admin_id: string;
    admin_name: string;
    follower_count: number;
    event_count: number;
    created_at: string;
    university?: string;
}

export default function AdminCommunitiesPage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [uniFilter, setUniFilter] = useState<'all' | 'metu' | 'bilkent'>('all');

    const fetchCommunities = async () => {
        try {
            const res = await fetch('/api/admin/communities');
            if (!res.ok) throw new Error('Topluluklar çekilemedi');
            const data = await res.json();
            setCommunities(data.communities);
        } catch (err: any) {
            toast.error('Topluluklar yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    const handleDelete = async (communityId: string) => {
        if (!window.confirm('Bu topluluğu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve topluluğa ait tüm veriler silinebilir.')) return;

        try {
            const res = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_community', communityId })
            });

            if (!res.ok) throw new Error('Silme işlemi başarısız');

            toast.success('Topluluk silindi');
            setCommunities(communities.filter(c => c.id !== communityId));
        } catch (err) {
            toast.error('Silme işlemi sırasında hata oluştu.');
        }
    };

    const filteredCommunities = useMemo(() => {
        return communities.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.category.toLowerCase().includes(search.toLowerCase()) ||
                c.admin_name.toLowerCase().includes(search.toLowerCase());
            
            const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
            
            // University filter
            let matchesUni = true;
            if (uniFilter !== 'all') {
                matchesUni = c.university === uniFilter || (!c.university && uniFilter === 'metu');
            }

            return matchesSearch && matchesCategory && matchesUni;
        });
    }, [communities, search, selectedCategory, uniFilter]);

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="space-y-4">
                    <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
                    <div className="h-4 w-96 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg animate-pulse"></div>
                </div>
                
                <div className="flex gap-3">
                    <div className="h-12 flex-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl animate-pulse"></div>
                    <div className="h-12 w-32 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl animate-pulse"></div>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 h-16"></div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="p-6 bg-white dark:bg-neutral-800 h-24 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <Building2 className="text-primary" size={32} />
                    Topluluk Yönetimi
                </h1>
                <p className="text-neutral-500 mt-1">Platformdaki tüm öğrenci topluluklarını denetle</p>
            </header>

            {/* Standardized Search & Filter Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Topluluk, kategori veya yönetici ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                        showFilters 
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent' 
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}
                >
                    <Filter size={18} />
                    <span>Filtreler</span>
                    <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showFilters && (
                <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                    {/* University Filter */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Üniversite</label>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { id: 'all', label: 'Tümü' },
                                { id: 'metu', label: 'ODTÜ' },
                                { id: 'bilkent', label: 'Bilkent' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => setUniFilter(btn.id as any)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        uniFilter === btn.id
                                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                                            : 'bg-white text-neutral-500 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700'
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                     <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Kategori Filtresi</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                                        : 'bg-white text-neutral-500 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700'
                                }`}
                            >
                                Tümü
                            </button>
                            {COMMUNITY_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                                            : 'bg-white text-neutral-500 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700'
                                    }`}
                                >
                                    {cat}
                                    <span className="ml-1.5 opacity-60 font-mono">
                                        {communities.filter(c => c.category === cat).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Communities Table Header with Counter */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="text-sm font-medium text-neutral-500">
                    {filteredCommunities.length} / {communities.length} topluluk gösteriliyor
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                            <tr>
                                <th className="px-6 py-4">Topluluk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Yönetici</th>
                                <th className="px-6 py-4">İstatistikler</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {filteredCommunities.length > 0 ? filteredCommunities.map((community) => (
                                <tr key={community.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <Link 
                                                href={`/admin/communities/${community.id}`}
                                                className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:opacity-80 transition-opacity"
                                            >
                                                {community.logo_url ? (
                                                    <img src={community.logo_url} alt={community.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <Building2 size={24} />
                                                    </div>
                                                )}
                                            </Link>
                                            <div>
                                                <Link 
                                                    href={`/admin/communities/${community.id}`}
                                                    className="font-bold text-neutral-900 dark:text-white hover:text-primary transition-colors block"
                                                >
                                                    {community.name}
                                                </Link>
                                                <span className="text-xs text-neutral-400 font-mono">ID: {community.id.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                                            {community.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-900 dark:text-white">{community.admin_name}</span>
                                            <span className="text-xs text-neutral-500">Yönetici</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400" title="Takipçi Sayısı">
                                                <Users size={14} />
                                                <span className="font-bold">{community.follower_count}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400" title="Etkinlik Sayısı">
                                                <Calendar size={14} />
                                                <span className="font-bold">{community.event_count}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end">
                                            <div className="relative group/menu">
                                                <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                                    <Settings size={18} />
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden z-10 hidden group-hover/menu:block animate-in fade-in slide-in-from-top-2">
                                                    <Link 
                                                        href={`/admin/communities/${community.id}`}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 flex items-center gap-2"
                                                    >
                                                        <Search size={14} /> Detaylar
                                                    </Link>
                                                    <Link 
                                                        href={`/dashboard?communityId=${community.id}`}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 flex items-center gap-2"
                                                    >
                                                        <Settings size={14} /> Yönetim Paneli
                                                    </Link>
                                                    <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1"></div>
                                                    <button
                                                        onClick={() => handleDelete(community.id)}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Sil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 italic">
                                        Topluluk bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
