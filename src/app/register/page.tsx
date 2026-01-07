'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent border-[var(--primary-color)] rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-neutral-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
