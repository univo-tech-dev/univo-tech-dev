'use client';

import { useAuth } from '@/contexts/AuthContext';
import BanScreen from '@/components/BanScreen';

export default function MetuVerificationGuard({ children }: { children: React.ReactNode }) {
    const { isBanned, banInfo, signOut } = useAuth();

    // Show ban screen if user is banned
    if (isBanned) {
        return (
            <BanScreen
                banCategory={banInfo?.category}
                banReason={banInfo?.reason}
                bannedBy={banInfo?.bannedBy}
                onLogout={signOut}
            />
        );
    }

    return <>{children}</>;
}
