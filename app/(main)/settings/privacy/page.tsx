import { getUserProfile } from '@/lib/supabase/actions/auth';
// PrivacySettingsPage: Manages user privacy and block list
import { getBlockedUsers } from '@/lib/supabase/actions/social';
import { BlockList } from '@/components/social/BlockList';
import { redirect } from 'next/navigation';

export default async function PrivacySettingsPage() {
  const user = await getUserProfile();
  if (!user) redirect('/auth/login');

  const blockedUsers = await getBlockedUsers();

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="flex flex-col gap-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Privacy & Safety</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[3px]">Manage your social boundaries</p>
        </div>

        <section className="space-y-6">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Blocked Users</h2>
              <div className="h-px flex-1 bg-white/5" />
           </div>
           <p className="text-sm text-[--flx-text-2]">
             Blocked users cannot send you messages, join your watch parties, or see your activity.
           </p>
           <BlockList initialBlocked={blockedUsers} />
        </section>
      </div>
    </div>
  );
}
