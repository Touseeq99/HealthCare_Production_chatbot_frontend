'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 text-lg">Last updated: 01/09/2025</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-10 border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 text-lg leading-relaxed mb-8">
              Welcome to MetaMed (“the Application”, “the App”, “we”, “our”, or “us”). These Terms and Conditions (“Terms”) govern your use of the MetaMed application and any related website or services. By accessing or using the App, you agree to these Terms. If you do not agree, you must not use the App.
            </p>
            
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">1. Purpose of the Application</h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>MetaMed is a clinical decision support tool designed for use by healthcare professionals for educational purposes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>The App is designed to allow secure communication and information transmission between healthcare workers and patients.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>The App is not intended as a substitute for professional medical advice, diagnosis, or treatment.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">2. Eligibility</h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You must be a licensed healthcare professional or an authorized clinical researcher to use the App in a medical decision-making context.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>By using the App, you confirm that you meet these requirements.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">3. Medical Disclaimer</h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>The App provides decision support only and does not replace clinical judgment.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>All outputs should be interpreted by a healthcare professional in the context of individual patient care.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>We do not guarantee that recommendations will be complete, accurate, or up to date with every clinical guideline.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>Patients must always seek medical advice directly from their healthcare provider.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">4. User Responsibilities</h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You agree to enter only accurate, validated clinical data.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You are responsible for verifying outputs before applying them in clinical practice.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You agree not to misuse the App for non-clinical, harmful, or unlawful purposes.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">5. Data Privacy</h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>We respect your privacy and comply with GDPR and other applicable data protection laws.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>Clinical data entered is not shared with third parties except as required by law.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">6. License and Restrictions</h2>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>We grant you a limited, non-transferable, revocable license to use the App for professional purposes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You may not reverse-engineer, copy, or distribute the App.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You may not use the App for patient self-diagnosis.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>You may not misrepresent outputs as independent medical advice.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">7. Intellectual Property</h2>
                <p className="text-slate-700 mb-4">
                  All intellectual property in MetaMed, including algorithms, logic models, and trademarks, belongs to Metamed.
                  Unauthorized use of the App's content, branding, or technology is prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">8. Limitation of Liability</h2>
                <p className="text-slate-700 mb-4">
                  To the fullest extent permitted by law, we disclaim liability for any reliance on outputs generated by the App, 
                  indirect, incidental, or consequential damages. The App is provided "as is" without warranties of any kind.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">9. Termination</h2>
                <p className="text-slate-700 mb-4">
                  We may suspend or terminate access if you violate these Terms. You may stop using the App at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">10. Governing Law</h2>
                <p className="text-slate-700 mb-4">
                  These Terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the Irish courts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">11. Modifications</h2>
                <p className="text-slate-700 mb-4">
                  We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">12. Contact Us</h2>
                <p className="text-slate-700">
                  If you have any questions about these Terms, please contact us at{' '}
                  <a href="mailto:info@metamed.com" className="text-blue-600 hover:underline">info@metamed.com</a>.<br />
                  26 Upper Pembroke St, Dublin 2
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <Link 
          href="/" 
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
