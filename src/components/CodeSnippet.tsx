import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeSnippet as CodeSnippetType } from '../types';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ChevronDown, Copy, Check, History, Code2 } from 'lucide-react';
import { ChangelogModal } from './ChangelogModal';

SyntaxHighlighter.registerLanguage('typescript', typescript);

interface CodeSnippetProps {
  snippet: CodeSnippetType;
}

export function CodeSnippet({ snippet }: CodeSnippetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const defaultPreviewImage = `https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&h=120&q=80`;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6"
      >
        <div className="p-6">
          <div className="flex gap-6">
            <div className="relative flex-shrink-0 w-[120px] h-[80px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {snippet.previewImage ? (
                <img
                  src={snippet.previewImage}
                  alt={snippet.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = defaultPreviewImage;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
                  <Code2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {snippet.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                      v{snippet.version}
                    </span>
                    <button
                      onClick={() => setIsChangelogOpen(true)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      title="View changelog"
                    >
                      <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {snippet.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last updated:{' '}
                    {new Date(snippet.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  {isCopied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                language={snippet.language}
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  padding: '2rem',
                }}
              >
                {snippet.code}
              </SyntaxHighlighter>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        changes={snippet.changes}
        title={snippet.title}
      />
    </>
  );
}
