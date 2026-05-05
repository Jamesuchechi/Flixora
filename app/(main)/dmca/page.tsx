import React from 'react';
import { ShieldAlert, FileText, Send, Play } from 'lucide-react';

export const metadata = {
  title: 'DMCA Policy | Flixora',
  description: 'Flixora copyright infringement notification policy.',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-6 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white flex items-center gap-4">
            <ShieldAlert className="w-10 h-10 md:w-16 md:h-16 text-[--flx-pink]" />
            DMCA Policy
          </h1>
          <p className="text-[--flx-text-3] text-lg leading-relaxed">
            Flixora respects the intellectual property rights of others and expects its users to do the same.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="p-8 rounded-3xl bg-white/2 border border-white/5 animate-fade-up">
            <Play className="w-8 h-8 text-red-500 mb-6 fill-current" />
            <h3 className="text-xl font-bold text-white mb-4">How it works</h3>
            <p className="text-[--flx-text-3] leading-relaxed">
              Flixora is a curation platform utilizing the YouTube Embedded Player API. We do not host, upload, or store any video files on our servers. All content is streamed directly from YouTube.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-white/2 border border-white/5 animate-fade-up [animation-delay:100ms]">
            <FileText className="w-8 h-8 text-[--flx-cyan] mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Takedown Requests</h3>
            <p className="text-[--flx-text-3] leading-relaxed">
              The most effective way to remove infringing content is to submit a complaint to YouTube. Once removed there, it becomes unavailable on Flixora automatically.
            </p>
          </div>
        </div>

        <div className="space-y-12 mb-20">
          <section className="animate-fade-up [animation-delay:200ms]">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-l-4 border-[--flx-pink] pl-6">
              Submission Guidelines
            </h2>
            <p className="text-[--flx-text-2] leading-relaxed mb-6 pl-7">
              If you wish to submit a DMCA notice directly to us to remove a link from our curation database, please include the following:
            </p>
            <ul className="space-y-4 pl-7">
              {[
                "Physical or electronic signature of the copyright owner or authorized agent.",
                "Identification of the copyrighted work claimed to have been infringed.",
                "The specific URL on Flixora containing the infringing material.",
                "Contact information including name, address, and email.",
                "A statement of 'good faith belief' that the use is not authorized.",
                "A statement that the information in the notification is accurate."
              ].map((item, i) => (
                <li key={i} className="flex gap-4 text-[--flx-text-3]">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[--flx-pink] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="animate-fade-up [animation-delay:300ms]">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-l-4 border-[--flx-purple] pl-6">
              Where to Send
            </h2>
            <div className="bg-white/3 border border-white/10 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[--flx-purple]/10 flex items-center justify-center border border-[--flx-purple]/20">
                  <Send className="w-8 h-8 text-[--flx-purple]" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Email our Copyright Agent</h4>
                  <p className="text-[--flx-text-3]">dmca@flixora.com</p>
                </div>
              </div>
              <a 
                href="mailto:dmca@flixora.com" 
                className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform"
              >
                Send Notice
              </a>
            </div>
          </section>
        </div>

        <p className="text-center text-[--flx-text-3] text-sm italic">
          Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability.
        </p>
      </div>
    </div>
  );
}
