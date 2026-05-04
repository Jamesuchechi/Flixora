import { notFound } from 'next/navigation';
import { getPublicProfileData } from '@/lib/supabase/actions/profiles';
import { getUserProfile } from '@/lib/supabase/actions/auth';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PinnedMedia } from '@/components/profile/PinnedMedia';
import { ActivityMiniFeed } from '@/components/profile/ActivityMiniFeed';
import { UserLists } from '@/components/profile/UserLists';
import { getFriendshipStatus } from '@/lib/supabase/actions/social';
import { Metadata } from 'next';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfileData(username);

  if (!data) {
    return {
      title: 'User Not Found | Flixora',
    };
  }

  return {
    title: `${data.profile.username}'s Profile | Flixora`,
    description: data.profile.bio || `Check out ${data.profile.username}'s cinema profile on Flixora.`,
    openGraph: {
      images: [data.profile.avatar_url || ''],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profileData = await getPublicProfileData(username);

  if (!profileData) {
    notFound();
  }

  const currentUser = await getUserProfile();
  const isOwnProfile = currentUser?.profile?.id === profileData.profile.id;

  // Fetch friendship status if not own profile
  let friendshipStatus = null;
  if (!isOwnProfile && currentUser?.profile?.id) {
    friendshipStatus = await getFriendshipStatus(profileData.profile.id);
  }

  return (
    <div className="min-h-screen bg-[--flx-bg] pb-20">
      <ProfileHeader 
        profile={profileData.profile} 
        isOwnProfile={isOwnProfile}
        isFriend={friendshipStatus?.status === 'accepted'}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pinned Media Section */}
        {profileData.pinnedMedia && (
          <PinnedMedia 
            media={profileData.pinnedMedia} 
            mediaType={profileData.profile.pinned_media_type as 'movie' | 'tv'} 
          />
        )}

        <div className="mt-12 flex flex-col lg:flex-row gap-12">
          {/* Recent Activity */}
          <ActivityMiniFeed history={profileData.history} />

          {/* Public Lists */}
          <UserLists 
            lists={profileData.lists} 
            isOwnProfile={isOwnProfile} 
          />
        </div>

        {/* Favorite Genres (Placeholder UI for now) */}
        {profileData.favoriteGenres?.length > 0 && (
          <section className="mt-16">
             <h2 className="text-xl font-bold text-white tracking-tight uppercase mb-6">Favorite Genres</h2>
             <div className="flex flex-wrap gap-3">
                {profileData.favoriteGenres.map(name => (
                  <div key={name} className="px-6 py-3 rounded-2xl bg-[--flx-surface-1] border border-[--flx-border] text-white font-medium hover:border-[--flx-purple]/50 transition-all cursor-pointer">
                    {name}
                  </div>
                ))}
             </div>
          </section>
        )}
      </div>
    </div>
  );
}
