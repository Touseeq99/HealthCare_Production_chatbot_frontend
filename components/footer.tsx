import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rose-50/50 text-slate-500 py-20 border-t border-rose-100">
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
                <span className="font-bold text-rose-950 text-lg leading-none">CLARA</span>
                <span className="text-[10px] text-rose-500 leading-none">by MetaMedMD</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-slate-600 font-medium">
              Intelligent clinical reasoning. Evidence-based, explainable, and designed for the way clinicians think.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-primary">Platform</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/#how-it-works" className="hover:text-rose-500 transition-colors">How It Works</Link></li>
              <li><Link href="/#clinical-evidence" className="hover:text-rose-500 transition-colors">Clinical Evidence</Link></li>
              <li><Link href="/#use-cases" className="hover:text-rose-500 transition-colors">Use Cases</Link></li>
              <li><Link href="/signup" className="hover:text-rose-500 transition-colors">Request Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-primary">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/about" className="hover:text-rose-500 transition-colors">About CLARA</Link></li>
              <li><Link href="/philosophy" className="hover:text-rose-500 transition-colors">Clinical Philosophy</Link></li>
              <li><Link href="/research" className="hover:text-rose-500 transition-colors">Research</Link></li>
              <li><Link href="/contact" className="hover:text-rose-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 font-primary">Governance</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/ethics" className="hover:text-rose-500 transition-colors">Ethics & Safety</Link></li>
              <li><Link href="/privacy" className="hover:text-rose-500 transition-colors">Data Privacy</Link></li>
              <li><Link href="/compliance" className="hover:text-rose-500 transition-colors">Compliance</Link></li>
              <li><Link href="/terms" className="hover:text-rose-500 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <div>
            © {currentYear} CLARA by MetamedMD. All rights reserved.
          </div>
          <div className="text-slate-400">
            For clinical professionals. Not intended for direct patient use.
          </div>
        </div>
      </div>
    </footer>
  );
}
