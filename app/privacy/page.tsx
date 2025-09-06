import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-6">
        MetaMed (“the Application”, “the App”, “we”, “our”, or “us”) respects your privacy and is committed to protecting your personal and clinical information. This Privacy Policy explains how we collect, use, store, and protect data when you use MetaMed.

By using the App, you agree to this Privacy Policy. If you do not agree, you must not use the App.
          
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We may collect personal information such as your name, email address, phone number, and health-related 
          information when you use our services.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
      
Provide decision support outputs (risk scores, recommendations, summaries).
Improve the accuracy, safety, and performance of the App.
Ensure compliance with medical guidelines.
Communicate with you regarding updates, support, or policy changes.

We do not use personal or clinical data for advertising or marketing.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Security</h2>
        <p className="text-gray-700 mb-4">
        We do not sell or rent your data.
We may share data only in the following limited cases:

Legal Compliance: When required by law or regulatory authorities.
Service Providers: With trusted vendors that support App hosting or security (bound by confidentiality agreements).
Research and Development: Only anonymised, aggregated data may be used to improve medical AI performance.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
        <p className="text-gray-700 mb-4">
        Data is encrypted in transit and at rest.
Access to data is restricted to authorized healthcare professionals.
We use industry-standard safeguards to protect against unauthorized access, alteration, or disclosure.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">5. User Responsibilities</h2>
        <p className="text-gray-700 mb-4">
        You are responsible for ensuring that any clinical data entered into MetaMed is accurate and provided lawfully.
        If you input identifiable patient data, you must ensure you have appropriate consent and comply with GDPR or equivalent laws in your jurisdiction.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">5. User Responsibilities</h2>
        <p className="text-gray-700 mb-4">
        You are responsible for ensuring that any clinical data entered into MetaMed is accurate and provided lawfully.
        If you input identifiable patient data, you must ensure you have appropriate consent and comply with GDPR or equivalent laws in your jurisdiction.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights</h2>
        <p className="text-gray-700 mb-4">
        Depending on your jurisdiction (e.g., GDPR in the EU/EEA), you may have rights to:
Access your personal data.
Request correction or deletion.
Restrict or object to processing.
Request data portability.

You may exercise these rights by contacting us at info@metmed.com

        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes to This Policys</h2>
        <p className="text-gray-700 mb-4">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>

        
        <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:info@metamed.com" className="text-blue-600 hover:underline">info@metamed.com</a>.
          28 Upper Pembroke St, Dublin 2, Ireland

        </p>
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
