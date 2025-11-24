import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export function TaxReceiptPolicyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/legal/tax-receipt-policy.md')
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading tax receipt policy:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="prose prose-green max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        
        {/* Tax Relief Highlight */}
        <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🇰🇪 Kenyan Tax Relief Available
          </h3>
          <p className="text-green-800 mb-4">
            Donations to KRA-approved organizations may be tax-deductible under Section 15(2)(p) 
            of the Kenya Income Tax Act. Add your KRA PIN to your profile to receive compliant tax receipts.
          </p>
          <a
            href="/profile/settings"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add KRA PIN to Profile
          </a>
        </div>
      </div>
    </div>
  );
}
