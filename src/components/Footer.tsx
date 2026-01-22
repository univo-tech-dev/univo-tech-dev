'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const pathname = usePathname();
  const { profile } = useAuth();
  
  const university = profile?.university || 'metu'; // Default to metu
  
  // Hide footer on login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isBilkent = university === 'bilkent';
  const isCankaya = university === 'cankaya';
  
  return (
    <footer className="bg-white dark:bg-neutral-900 mt-20 pb-12 transition-colors">
      {/* Double Line Separator */}
      <div className="w-full border-t-4 border-black dark:border-white mb-1"></div>
      <div className="w-full border-t-2 border-black dark:border-white mb-12"></div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-4xl font-black font-serif uppercase tracking-tighter border-b border-black dark:border-white pb-2 inline-block dark:text-white transition-colors">
              Univo
            </h3>
            <p className="text-neutral-900 dark:text-neutral-200 font-serif italic leading-relaxed text-sm">
              "Kampüsün nabzı, öğrencinin sesi." <br />
              Ankara'nın en güncel üniversite gazetesi.
            </p>
            <div className="pt-4">
              <span className="inline-block bg-black dark:bg-neutral-800 text-white dark:text-neutral-300 px-3 py-1 font-bold text-xs uppercase tracking-widest transition-colors">
                EST. 2025
              </span>
            </div>
          </div>

          {/* Navigation - Vertical Rules */}
          <div className="md:col-span-1 border-l-0 md:border-l-2 border-black dark:border-white pl-0 md:pl-8 dark:text-white transition-colors">
            <h4 className="font-bold font-serif uppercase mb-4 text-sm tracking-wider">Bölümler</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><a href="/" className="hover:underline decoration-2 underline-offset-2">Resmi Gündem</a></li>
              <li><a href="/?tab=community" className="hover:underline decoration-2 underline-offset-2">Topluluk Meydanı</a></li>
              <li><a href="/?tab=voice" className="hover:underline decoration-2 underline-offset-2">Kampüsün Sesi</a></li>
            </ul>
          </div>

          <div className="md:col-span-1 border-l-0 md:border-l-2 border-black dark:border-white pl-0 md:pl-8 dark:text-white transition-colors">
            <h4 className="font-bold font-serif uppercase mb-4 text-sm tracking-wider">Kampüs Rehberi</h4>
            <ul className="space-y-2 text-sm font-medium">
              {isBilkent ? (
                <>
                  <li><a href="https://moodle.bilkent.edu.tr" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Bilkent Moodle</a></li>
                  <li><a href="https://bilkent.edu.tr/bilkent/ulasim/" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Ring Saatleri</a></li>
                  <li><a href="https://library.bilkent.edu.tr" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Kütüphane</a></li>
                  <li><a href="https://bilkent.edu.tr/bilkent/academic-calendar/" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Akademik Takvim</a></li>
                  <li><a href="https://stars.bilkent.edu.tr/srs" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Stars SRS</a></li>
                </>
              ) : isCankaya ? (
                <>
                  <li><a href="https://webonline.cankaya.edu.tr" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">WebOnline (Moodle)</a></li>
                  <li><a href="https://sql.cankaya.edu.tr" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Öğrenci Bilgi Sistemi</a></li>
                  <li><a href="https://kutuphane.cankaya.edu.tr" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Kütüphane</a></li>
                  <li><a href="https://www.cankaya.edu.tr/akademik_takvim/" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Akademik Takvim</a></li>
                  <li><a href="https://www.cankaya.edu.tr/duyuru/servis.php" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Servis Saatleri</a></li>
                </>
              ) : (
                <>
                  <li><a href="/?view=official" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Yemekhane Menüsü</a></li>
                  <li><a href="https://tim.metu.edu.tr/tr/ring-services" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Ring Saatleri</a></li>
                  <li><a href="https://lib.metu.edu.tr" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Kütüphane Durumu</a></li>
                  <li><a href="https://oidb.metu.edu.tr/tr/akademik-takvim" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Akademik Takvim</a></li>
                  <li><a href="https://ohpha1.netlify.app" target="_blank" className="hover:bg-neutral-100 dark:hover:bg-neutral-800 block -ml-2 px-2 py-1 transition-colors rounded-sm">Hazırlık Ort. Hesaplama</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact / Legal */}
          <div className="md:col-span-1 border-l-0 md:border-l-2 border-black dark:border-neutral-600 pl-0 md:pl-8 transition-colors">
            <h4 className="font-bold font-serif uppercase mb-4 text-sm tracking-wider dark:text-white">Künye</h4>
            <address className="not-italic text-sm text-neutral-600 dark:text-neutral-400 mb-6 font-serif">
              {isBilkent ? (
                <>
                  Bilkent Üniversitesi<br />
                  Üniversiteler Mah.<br />
                  06800 Bilkent/Ankara
                </>
              ) : isCankaya ? (
                <>
                  Çankaya Üniversitesi<br />
                  Eskişehir Yolu 29. Km<br />
                  06790 Etimesgut/Ankara
                </>
              ) : (
                <>
                  ODTÜ Üniversiteler Mah.<br />
                  Dumlupınar Blv. No:1<br />
                  06800 Çankaya/Ankara
                </>
              )}
            </address>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">
              &copy; {new Date().getFullYear()} UNIVO GAZETTE.<br />Tüm Hakları Saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
