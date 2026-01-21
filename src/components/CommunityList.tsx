import { Community } from '@/types';
import CommunityCard from './CommunityCard';

interface CommunityListProps {
    communities: (Community & {
        logo_url?: string;
        admin_id?: string;
        profiles?: {
            university?: string;
        };
    })[];
}

export default function CommunityList({ communities }: CommunityListProps) {
    if (communities.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-neutral-500 text-lg">
                    Bu kategoride henüz topluluk bulunmuyor.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
                <CommunityCard
                    key={community.id}
                    community={community}
                />
            ))}
        </div>
    );
}
