import React from 'react';

export const metadata = {
  title: 'Terms of Service | Flixora',
  description: 'The terms and conditions for using the Flixora streaming platform.',
};

export default function TermsPage() {
  const lastUpdated = "May 5, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Flixora, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily stream the content on Flixora for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not modify the materials, use them for commercial purposes, or attempt to decompile any software contained on the platform."
    },
    {
      title: "3. YouTube Terms",
      content: "Flixora utilizes YouTube API Services for video delivery. By using our service, you also agree to be bound by the YouTube Terms of Service (https://www.youtube.com/t/terms)."
    },
    {
      title: "4. Subscription & Billing",
      content: "Fees for subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. You may cancel your subscription at any time through your account settings."
    },
    {
      title: "5. Content Accuracy",
      content: "The materials appearing on Flixora could include technical, typographical, or photographic errors. Flixora does not warrant that any of the materials on its website are accurate, complete, or current."
    },
    {
      title: "6. Limitations",
      content: "In no event shall Flixora or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Flixora."
    },
    {
      title: "7. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of California, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location."
    }
  ];

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
            Terms of Service
          </h1>
          <p className="text-[--flx-text-3] flex items-center gap-2">
            Last Updated: <span className="text-[--flx-pink]">{lastUpdated}</span>
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <section key={i} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[--flx-cyan] pl-6">
                {section.title}
              </h2>
              <p className="text-[--flx-text-2] leading-relaxed pl-7">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-white/2 border border-white/5 text-center">
          <p className="text-[--flx-text-3] mb-4 italic">
            By continuing to use Flixora, you acknowledge that you have read and understood these terms.
          </p>
        </div>
      </div>
    </div>
  );
}
