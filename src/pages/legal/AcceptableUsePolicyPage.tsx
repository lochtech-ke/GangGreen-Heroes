import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export function AcceptableUsePolicyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/legal/acceptable-use-policy.md')
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading acceptable use policy:', error);
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
        
        {/* Report Violations */}
        <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Report Policy Violations
          </h3>
          <p className="text-red-800 mb-4">
            If you observe any violations of this Acceptable Use Policy, please report them immediately.
          </p>
          <a
            href="mailto:abuse@ganggreen.africa"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Report Abuse
          </a>
        </div>
      </div>
    </div>
  );
}
