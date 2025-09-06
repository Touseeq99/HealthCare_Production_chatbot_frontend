import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-gray-500 md:text-left">
            © {currentYear} MetaMed. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <a 
              href="mailto:info@metamed.com" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact: info@metamed.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
