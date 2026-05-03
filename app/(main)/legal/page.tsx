export const metadata = {
  title: 'Terms of Service | Flixora',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-8">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Legal & Terms</h1>
        
        <p className="text-white/60 leading-relaxed">
          By using Flixora, you agree to the following terms and acknowledge our operational model.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">YouTube Terms of Service</h2>
        <p className="text-white/60">
          Flixora uses YouTube API Services. By using our application, you are agreeing to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" className="text-[--flx-cyan] underline">YouTube Terms of Service</a>.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">Curation & Embedding</h2>
        <p className="text-white/60">
          Flixora only embeds videos where the uploader has enabled &quot;Allow Embedding&quot; via the YouTube platform. We do not bypass any technical restrictions, region locks, or monetization features (ads) implemented by the original uploader or YouTube.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">Privacy</h2>
        <p className="text-white/60">
          We do not sell your personal data. We track watch progress locally and in your private Supabase profile solely to improve your personal experience. For more details on how Google handles your data when watching via our player, please refer to the <a href="http://www.google.com/policies/privacy" target="_blank" className="text-[--flx-cyan] underline">Google Privacy Policy</a>.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">Disclaimers</h2>
        <p className="text-white/60 italic">
          Flixora is provided &quot;as is&quot; without warranty of any kind. We are not affiliated with, endorsed by, or sponsored by YouTube, Google, or any film studio mentioned on the platform.
        </p>
      </div>
    </div>
  );
}
