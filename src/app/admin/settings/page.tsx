'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings, Save, Shield, Power, Globe, Bell } from 'lucide-react';

interface SystemSetting {
    key: string;
    value: any;
    updated_at: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, any>>({
        maintenance_mode: false,
        registration_enabled: true,
        announcement_text: '',
        site_name: 'Univo',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/data');
            if (!res.ok) throw new Error('Ayarlar alınamadı');
            const data = await res.json();
            
            if (data.settings) {
                const mapped = { ...settings };
                data.settings.forEach((s: SystemSetting) => {
                    try {
                        mapped[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
                    } catch {
                        mapped[s.key] = s.value;
                    }
                });
                setSettings(mapped);
            }
        } catch (err) {
            toast.error('Ayarlar yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (key: string, value: any) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_setting', key, value })
            });

            if (!res.ok) throw new Error('Güncelleme başarısız');
            
            toast.success('Ayar güncellendi.');
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            toast.error('Ayar kaydedilirken hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-neutral-900 dark:text-white">
                    <Settings size={32} /> Sistem Ayarları
                </h1>
                <p className="text-neutral-500 mt-2">Platform genelindeki teknik yapılandırmalar</p>
            </header>

            <div className="space-y-6">
                {/* Maintenance Mode */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                <Power size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Bakım Modu</h3>
                                <p className="text-sm text-neutral-500">Siteyi geçici olarak erişime kapatın.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSave('maintenance_mode', !settings.maintenance_mode)}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.maintenance_mode ? 'bg-red-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Registration Switch */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Kullanıcı Kaydı</h3>
                                <p className="text-sm text-neutral-500">Yeni üyelik alımını kontrol edin.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSave('registration_enabled', !settings.registration_enabled)}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.registration_enabled ? 'bg-green-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.registration_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Announcement Banner */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Sistem Duyurusu</h3>
                            <p className="text-sm text-neutral-500">Tüm kullanıcıların göreceği banner metni.</p>
                        </div>
                    </div>
                    <textarea
                        value={settings.announcement_text}
                        onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                        placeholder="Örn: Hafta sonu sistem bakımı yapılacaktır..."
                        className="w-full h-24 p-4 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => handleSave('announcement_text', settings.announcement_text)}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-lg hover:opacity-90 transition-all shadow-md"
                        >
                            <Save size={18} /> Kaydet
                        </button>
                    </div>
                </div>

                {/* Site Name */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Site Başlığı</h3>
                            <p className="text-sm text-neutral-500">Platformun ismini değiştirin.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={settings.site_name}
                            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                            className="flex-1 p-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        <button
                            onClick={() => handleSave('site_name', settings.site_name)}
                            disabled={isSaving}
                            className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-lg hover:opacity-90 transition-all shadow-md"
                        >
                            <Save size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
