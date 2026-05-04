import { getUserProfile } from '@/lib/supabase/actions/auth';
import { getFriends } from '@/lib/supabase/actions/social';
import { FriendsUI } from '@/components/social/FriendsUI';
import { redirect } from 'next/navigation';

export default async function FriendsPage() {
  const user = await getUserProfile();
  if (!user) redirect('/auth/login');

  const friends = await getFriends();

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">My Friends</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[3px]">Manage your connections</p>
        </div>

        <FriendsUI initialFriends={friends} />
      </div>
    </div>
  );
}
