import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Trash2,
  X,
  User,
  ChevronDown,
  Edit2,
  Plus,
  Moon,
  Sun,
  Search,
  LayoutTemplate,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import toast from 'react-hot-toast';
import { Editor } from '@monaco-editor/react';

interface WorkspaceProps {
  onClose: () => void;
  onInsertCode: (code: string) => void;
  isAuthenticated: boolean;
  currentCode?: string;
  isOpen: boolean;
  showOutput: boolean;
  setShowOutput: (show: boolean) => void;
}

interface SavedScript {
  id: string;
  title: string;
  code: string;
  createdAt: string;
  userId: string;
}

const profileContentVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.2, ease: 'easeOut' },
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 8,
    transition: {
      height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.2, ease: 'easeIn', delay: 0.1 },
    },
  },
};

const chevronVariants = {
  up: {
    rotate: 180,
    transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
  },
  down: {
    rotate: 0,
    transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
  },
};

export function Workspace({
  onClose,
  onInsertCode,
  isAuthenticated,
  currentCode,
  isOpen,
  showOutput,
  setShowOutput,
}: WorkspaceProps) {
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCode, setEditCode] = useState('');
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredScripts, setFilteredScripts] = useState<SavedScript[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadScripts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      setIsDark(theme === 'dark');
    }
  }, []);

  useEffect(() => {
    const filtered = scripts.filter(
      (script) =>
        script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredScripts(filtered);
  }, [searchQuery, scripts]);

  const loadScripts = async () => {
    if (!auth.currentUser) return;

    try {
      const scriptsQuery = query(
        collection(db, 'scripts'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(scriptsQuery);
      const scriptsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedScript[];
      setScripts(
        scriptsData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setFilteredScripts(scriptsData);
    } catch (error) {
      console.error('Error loading scripts:', error);
      toast.error('Failed to load saved scripts');
    }
  };

  const handleSaveScript = async () => {
    if (!auth.currentUser || !currentCode) return;

    try {
      const title = prompt('Enter a title for your script:');
      if (!title) return;

      const newScript = {
        title,
        code: currentCode,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid,
      };

      await addDoc(collection(db, 'scripts'), newScript);
      toast.success('Script saved successfully');
      loadScripts();
    } catch (error) {
      console.error('Error saving script:', error);
      toast.error('Failed to save script. Please try again.');
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this script?')) return;

    try {
      const scriptRef = doc(db, 'scripts', id);
      const scriptDoc = await getDoc(scriptRef);

      if (!scriptDoc.exists()) {
        toast.error('Script not found');
        return;
      }

      const scriptData = scriptDoc.data();
      if (scriptData.userId !== auth.currentUser?.uid) {
        toast.error('You do not have permission to delete this script');
        return;
      }

      await deleteDoc(scriptRef);
      toast.success('Script deleted successfully');
      loadScripts();
    } catch (error) {
      console.error('Error deleting script:', error);
      toast.error('Failed to delete script. Please try again.');
    }
  };

  const handleUpdateScript = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const scriptRef = doc(db, 'scripts', id);
      const scriptDoc = await getDoc(scriptRef);

      if (!scriptDoc.exists()) {
        toast.error('Script not found');
        return;
      }

      const scriptData = scriptDoc.data();
      if (scriptData.userId !== auth.currentUser?.uid) {
        toast.error('You do not have permission to update this script');
        return;
      }

      await updateDoc(scriptRef, {
        title: editTitle,
        code: editCode,
        updatedAt: new Date().toISOString(),
      });

      toast.success('Script updated successfully');
      loadScripts();
      setEditingScript(null);
      setEditTitle('');
      setEditCode('');
    } catch (error) {
      console.error('Error updating script:', error);
      toast.error('Failed to update script. Please try again.');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', newTheme);
  };

  const toggleOutput = async () => {
    setShowOutput(!showOutput);
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'settings', 'editor'), {
          showOutput: !showOutput,
        });
      } catch (error) {
        console.error('Error saving output preference:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl z-50"
          onMouseLeave={() => onClose()}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Workspace
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveScript}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
                  disabled={!isAuthenticated}
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Script</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scripts..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredScripts.map((script) => (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2"
                >
                  {editingScript === script.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 rounded border dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Enter new title"
                      />
                      <div className="h-32 border rounded dark:border-gray-500 overflow-hidden">
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          theme={isDark ? 'vs-dark' : 'light'}
                          value={editCode}
                          onChange={(value) => setEditCode(value || '')}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            lineNumbers: 'off',
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateScript(script.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingScript(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {script.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingScript(script.id);
                            setEditTitle(script.title);
                            setEditCode(script.code);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScript(script.id)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {!editingScript && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => onInsertCode(script.code)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                      >
                        Insert
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              <motion.button
                onClick={() => setShowProfile(!showProfile)}
                className="w-full flex items-center justify-between p-4"
                whileHover={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(243, 244, 246, 0.8)' }}
                whileTap={{ backgroundColor: isDark ? 'rgba(75, 85, 99, 0.9)' : 'rgba(229, 231, 235, 0.9)', scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </div>
                <motion.div
                  variants={chevronVariants}
                  animate={showProfile ? 'up' : 'down'}
                  initial={false}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <AnimatePresence initial={false}>
                {showProfile && (
                  <motion.div
                    variants={profileContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="px-4 overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4 py-2"
                    >
                      <div>
                        <p className="font-medium">{auth.currentUser?.email}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Show Output Panel</span>
                        <motion.button
                          onClick={toggleOutput}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LayoutTemplate className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Theme</span>
                        <motion.button
                          onClick={toggleTheme}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isDark ? (
                            <Sun className="w-4 h-4" />
                          ) : (
                            <Moon className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}