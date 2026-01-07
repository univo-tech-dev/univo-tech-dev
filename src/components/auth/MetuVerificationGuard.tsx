import { toast } from 'sonner';

export default function MetuVerificationGuard({ children }: { children: React.ReactNode }) {
    // GUARD DISABLED BY USER REQUEST
    // Previously forced ODTÜ login for unverified users. 
    // Now just renders children directly.
    return <>{children}</>;
}
