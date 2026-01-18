'use client';

import { useEffect, useState, useMemo } from 'react';
import { Activity, Clock, Filter, X, Search, User, Shield, ChevronDown } from 'lucide-react';

interface AuditLog {
    id: string;
    admin_name: string;
    action: string;
    details: string;
    created_at: string;
    target_user_name?: string | null;
    target_user_id?: string | null;
}

// Action type labels
const ACTION_LABELS: Record<string, string> = {
    'USER_BAN': 'Kullanıcı Yasaklama',
    'USER_UNBAN': 'Yasak Kaldırma',
    'POST_DELETE': 'Gönderi Silme',
    'COMMENT_DELETE': 'Yorum Silme',
    'REPORT_REVIEW': 'Şikayet İnceleme',
    'REPORT_RESOLVE': 'Şikayet Çözme',
    'REPORT_DISMISS': 'Şikayet Reddetme',
};

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [allAdmins, setAllAdmins] = useState<{id: string, full_name: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter states
    const [actionFilter, setActionFilter] = useState<string>('');
    const [adminFilter, setAdminFilter] = useState<string>('');
    const [targetUserFilter, setTargetUserFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const [logsRes, adminsRes] = await Promise.all([
                    fetch('/api/admin/logs'),
                    fetch('/api/admin/admins')
                ]);

                if (logsRes.ok) {
                    const data = await logsRes.json();
                    setLogs(data);
                }
                
                if (adminsRes.ok) {
                    const adminData = await adminsRes.json();
                    console.log('Fetched Admins:', adminData);
                    setAllAdmins(adminData);
                } else {
                    console.error('Failed to fetch admins');
                }
            } catch (error) {
                console.error('Error fetching logs/admins:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Unique values for filters
    const uniqueActions = useMemo(() => [...new Set(logs.map(l => l.action))], [logs]);
    // Removed uniqueAdmins calculation as we now fetch all admins explicitly
    const uniqueTargetUsers = useMemo(() => 
        [...new Set(logs.map(l => l.target_user_name).filter(Boolean))] as string[], 
    [logs]);

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (actionFilter && log.action !== actionFilter) return false;
            if (adminFilter && log.admin_name !== adminFilter) return false;
            if (targetUserFilter && log.target_user_name !== targetUserFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesDetails = log.details?.toLowerCase().includes(q);
                const matchesAdmin = log.admin_name?.toLowerCase().includes(q);
                const matchesTarget = log.target_user_name?.toLowerCase().includes(q);
                const matchesAction = log.action?.toLowerCase().includes(q);
                if (!matchesDetails && !matchesAdmin && !matchesTarget && !matchesAction) return false;
            }
            return true;
        });
    }, [logs, actionFilter, adminFilter, targetUserFilter, searchQuery]);

    const activeFilterCount = [actionFilter, adminFilter, targetUserFilter].filter(Boolean).length;

    const clearAllFilters = () => {
        setActionFilter('');
        setAdminFilter('');
        setTargetUserFilter('');
        setSearchQuery('');
    };

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

                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 h-[600px] animate-pulse shadow-sm"></div>
            </div>
        );
    }


    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-neutral-900 dark:text-white">
                    <Activity size={32} className="text-primary" /> Admin Hareketleri
                </h1>
                <p className="text-neutral-500 mt-1">Sistemdeki tüm yönetici işlemleri</p>
            </header>

            {/* Search & Filter Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Detaylarda ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
                        />
                    </div>
                    
                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                            showFilters || activeFilterCount > 0 
                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent' 
                                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                        <Filter size={18} />
                        <span>Filtreler</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Filter Dropdowns */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        {/* Action Filter */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">İşlem Türü</label>
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                            >
                                <option value="">Tümü</option>
                                {Object.keys(ACTION_LABELS).map(action => (
                                    <option key={action} value={action}>
                                        {ACTION_LABELS[action]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Admin Filter */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Yapan Admin</label>
                            <select
                                value={adminFilter}
                                onChange={(e) => setAdminFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                            >
                                <option value="">Tümü</option>
                                {allAdmins.map(admin => (
                                    <option key={admin.id} value={admin.full_name}>{admin.full_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Target User Filter */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Hedef Kullanıcı</label>
                            <select
                                value={targetUserFilter}
                                onChange={(e) => setTargetUserFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                            >
                                <option value="">Tümü</option>
                                {uniqueTargetUsers.map(user => (
                                    <option key={user} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear All */}
                        {activeFilterCount > 0 && (
                            <div className="sm:col-span-3 flex justify-end">
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                                >
                                    <X size={14} /> Filtreleri Temizle
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Active Filter Tags */}
                {activeFilterCount > 0 && !showFilters && (
                    <div className="flex flex-wrap gap-2">
                        {actionFilter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                {ACTION_LABELS[actionFilter] || actionFilter}
                                <button onClick={() => setActionFilter('')} className="hover:text-blue-900 dark:hover:text-blue-200"><X size={12} /></button>
                            </span>
                        )}
                        {adminFilter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                                <Shield size={12} /> {adminFilter}
                                <button onClick={() => setAdminFilter('')} className="hover:text-purple-900 dark:hover:text-purple-200"><X size={12} /></button>
                            </span>
                        )}
                        {targetUserFilter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                <User size={12} /> {targetUserFilter}
                                <button onClick={() => setTargetUserFilter('')} className="hover:text-green-900 dark:hover:text-green-200"><X size={12} /></button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-neutral-500 mb-4">
                {filteredLogs.length} / {logs.length} kayıt gösteriliyor
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-medium border-b border-neutral-200 dark:border-neutral-700">
                        <tr>
                            <th className="px-6 py-3">Tarih</th>
                            <th className="px-6 py-3">Yapan Admin</th>
                            <th className="px-6 py-3">İşlem</th>
                            <th className="px-6 py-3">Hedef Kullanıcı</th>
                            <th className="px-6 py-3">Detaylar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                    {activeFilterCount > 0 ? 'Filtrelere uygun kayıt bulunamadı.' : 'Henüz kayıt yok.'}
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(log.created_at).toLocaleString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded text-xs font-bold">
                                            {log.admin_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            log.action.includes('BAN') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                                            : log.action.includes('DELETE') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                            : log.action.includes('REPORT') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                        }`}>
                                            {ACTION_LABELS[log.action] || log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.target_user_name ? (
                                            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                                                {log.target_user_name}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                                        {log.details}
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
