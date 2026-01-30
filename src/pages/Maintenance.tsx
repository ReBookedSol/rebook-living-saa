import { Mail, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo/Brand area */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            ReBooked Living
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Message */}
        <div className="space-y-6 mb-12">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Coming Soon!
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Our site is currently being updated with exciting new features and improvements.
          </p>
          <p className="text-lg text-slate-400">
            Thank you for your patience. We're working hard to bring you a better experience.
          </p>
        </div>

        {/* Social Media CTA */}
        <div className="space-y-8">
          <p className="text-slate-300 font-semibold">
            Stay tuned on our social media for updates:
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              <Instagram size={20} />
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              <Facebook size={20} />
              Facebook
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              <Twitter size={20} />
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
          </div>

          {/* Email Contact */}
          <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-300 mb-3">Have questions? Reach out to us:</p>
            <a
              href="mailto:support@rebookedliving.com"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold"
            >
              <Mail size={20} />
              support@rebookedliving.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            © 2025 ReBooked Living. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
