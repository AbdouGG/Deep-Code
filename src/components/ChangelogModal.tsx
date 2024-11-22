import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChangeLog } from '../types';
import { X } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: ChangeLog[];
  title: string;
}

export function ChangelogModal({ isOpen, onClose, changes, title }: ChangelogModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Changelog: {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
            <div className="space-y-6">
              {changes.map((change) => (
                <div key={change.version} className="relative pl-4 border-l-2 border-indigo-500">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500" />
                  <div className="mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Version {change.version}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(change.date).toLocaleDateString()}
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {change.changes.map((item, index) => (
                      <li
                        key={index}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}