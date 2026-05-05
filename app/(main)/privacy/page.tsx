import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Flixora',
  description: 'Learn how Flixora collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  const lastUpdated = "May 5, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when you create an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, payment information, and any other information you choose to provide."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you technical notices and support messages, and to communicate with you about products, services, and events offered by Flixora."
    },
    {
      title: "3. YouTube API Services",
      content: "Flixora uses YouTube API Services to provide video content. By using Flixora, you are also bound by the Google Privacy Policy, which can be found at http://www.google.com/policies/privacy. We do not store or share your YouTube personal data."
    },
    {
      title: "4. Data Security",
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. We use industry-standard encryption for data in transit and at rest."
    },
    {
      title: "5. Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier."
    },
    {
      title: "6. Your Rights",
      content: "Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete the data we have on you. To exercise these rights, please contact us at privacy@flixora.com."
    }
  ];

  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
            Privacy Policy
          </h1>
          <p className="text-[--flx-text-3] flex items-center gap-2">
            Last Updated: <span className="text-[--flx-cyan]">{lastUpdated}</span>
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, i) => (
            <section key={i} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[--flx-purple] pl-6">
                {section.title}
              </h2>
              <p className="text-[--flx-text-2] leading-relaxed pl-7">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-white/2 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2">Questions about our Privacy Policy?</h3>
          <p className="text-[--flx-text-3] mb-6">
            If you have any questions or concerns about how we handle your data, please don&apos;t hesitate to reach out.
          </p>
          <a href="mailto:privacy@flixora.com" className="text-[--flx-cyan] hover:underline font-bold">
            privacy@flixora.com
          </a>
        </div>
      </div>
    </div>
  );
}
