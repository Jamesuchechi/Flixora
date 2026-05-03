export const metadata = {
  title: 'DMCA Policy | Flixora',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-[--flx-bg] pt-32 pb-20 px-8">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">DMCA Policy</h1>
        
        <p className="text-white/60 leading-relaxed">
          Flixora respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond promptly to claims of copyright infringement that are reported to our team.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">How Flixora Works</h2>
        <p className="text-white/60">
          Flixora is a curation platform that utilizes the **YouTube Embedded Player API**. We do not host, upload, or store any video files on our own servers. All video content is streamed directly from YouTube&apos;s servers.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">Takedown Requests</h2>
        <p className="text-white/60">
          If you are a copyright owner and believe that content appearing on Flixora infringes your rights, the most effective way to remove it is to **submit a copyright complaint directly to YouTube**, as they are the primary host.
        </p>
        <p className="text-white/60 mt-4">
          Once a video is removed from YouTube or restricted by the uploader, it will automatically become unavailable on Flixora.
        </p>

        <h2 className="text-xl font-bold text-white mt-12 mb-4 uppercase tracking-widest">Direct Notice</h2>
        <p className="text-white/60">
          Alternatively, you may request that we remove a specific link from our curation database. Please send a notice to <span className="text-[--flx-cyan]">dmca@flixora.com</span> including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-white/60 mt-4">
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>The specific URL on Flixora where the material is located.</li>
          <li>Your contact information (email, phone number).</li>
          <li>A statement that you have a good faith belief that the use is not authorized.</li>
        </ul>
      </div>
    </div>
  );
}
