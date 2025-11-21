import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useStrapiContent } from '../../hooks/useStrapiContent';
import { strapiService } from '../../services/strapi.service';
import { useEffect, useState } from 'react';

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [fallbackContent, setFallbackContent] = useState<string | null>(null);
  const [loadingFallback, setLoadingFallback] = useState(false);

  // Fetch from Strapi
  const { data: document, loading, error } = useStrapiContent(
    () => strapiService.getLegalDocument(slug!),
    [slug]
  );

  // Load fallback content if Strapi fails
  useEffect(() => {
    if (error && !strapiService.isConfigured()) {
      setLoadingFallback(true);
      // Try to load from static markdown files as fallback
      fetch(`/legal/${slug}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('Fallback not found');
          return res.text();
        })
        .then((text) => {
          setFallbackContent(text);
          setLoadingFallback(false);
        })
        .catch((fallbackError) => {
          console.error('Error loading fallback content:', fallbackError);
          setLoadingFallback(false);
        });
    }
  }, [error, slug]);

  // Loading state
  if (loading || loadingFallback) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (no fallback available)
  if (error && !fallbackContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Document Not Available
            </h2>
            <p className="text-gray-600 mb-6">
              We're having trouble loading this document. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Strapi content
  if (document) {
    const { attributes } = document;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {attributes.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">
                Version {attributes.version}
              </span>
              <span>•</span>
              <span>
                Effective {new Date(attributes.effectiveDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {attributes.publishedAt && (
                <>
                  <span>•</span>
                  <span>
                    Last updated {new Date(attributes.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-green max-w-none">
            <ReactMarkdown>{attributes.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Render fallback content
  if (fallbackContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Warning banner */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Viewing cached version
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  This document is being loaded from a backup source. Some content may be outdated.
                </p>
              </div>
            </div>
          </div>

          {/* Fallback content */}
          <div className="prose prose-green max-w-none">
            <ReactMarkdown>{fallbackContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
