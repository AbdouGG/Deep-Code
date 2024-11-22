import React, { useState } from 'react';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { CodeSnippet } from '../types';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);

interface SnippetViewProps {
  snippet: CodeSnippet;
  onEdit: () => void;
  onDelete: () => void;
}

export function SnippetView({ snippet, onEdit, onDelete }: SnippetViewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {snippet.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {snippet.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-4 right-4 p-2 bg-gray-800/80 dark:bg-gray-700/80 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors backdrop-blur-sm"
          title={isCopied ? 'Copied!' : 'Copy code'}
        >
          {isCopied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
        <SyntaxHighlighter
          language={snippet.language}
          style={atomOneDark}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            padding: '2rem',
          }}
          showLineNumbers
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
