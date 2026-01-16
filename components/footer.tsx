import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1120] text-slate-400 py-20 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-8 h-8 opacity-90">
                <Image
                  src="/MetamedMDlogo (2).png"
                  alt="MetaMedMD Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-none">CLARA</span>
                <span className="text-[10px] text-slate-500 leading-none">by MetaMedMD</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Intelligent clinical reasoning. Evidence-based, explainable, and designed for the way clinicians think.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/#platform" className="hover:text-teal-400 transition-colors">How It Works</Link></li>
              <li><Link href="/#evidence" className="hover:text-teal-400 transition-colors">Evidence Base</Link></li>
              <li><Link href="/#use-cases" className="hover:text-teal-400 transition-colors">Use Cases</Link></li>
              <li><Link href="/request-access" className="hover:text-teal-400 transition-colors">Request Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About CLARA</Link></li>
              <li><Link href="/philosophy" className="hover:text-teal-400 transition-colors">Clinical Philosophy</Link></li>
              <li><Link href="/research" className="hover:text-teal-400 transition-colors">Research</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Governance</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/ethics" className="hover:text-teal-400 transition-colors">Ethics & Safety</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Data Privacy</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-400 transition-colors">Compliance</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div>
            © {currentYear} CLARA by MetamedMD. All rights reserved.
          </div>
          <div className="text-slate-500">
            For clinical professionals. Not intended for direct patient use.
          </div>
        </div>
      </div>
    </footer>
  );
}
