import React, { useEffect, useState, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import {
  Play,
  Trash2,
  Wifi,
  WifiOff,
  LogIn,
  Menu,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { encode, decode } from 'base-64';
import { Workspace } from './Workspace';
import { LoginModal } from './LoginModal';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function CodeExecutor() {
  const { ip } = useParams<{ ip: string }>();
  const [code, setCode] = useState(
    '// Welcome to the Code Executor! 🚀\n// Write your code here and see it come to life.\n\nconsole.log("Hello, World!");\n'
  );
  const [output, setOutput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [hasRetried, setHasRetried] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [showOutput, setShowOutput] = useState(() => {
    const savedPreference = localStorage.getItem('showOutput');
    return savedPreference !== null ? JSON.parse(savedPreference) : true;
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('editorTheme');
    if (savedTheme) return savedTheme;
    return document.documentElement.classList.contains('dark')
      ? 'vs-dark'
      : 'vs';
  });

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          const newTheme = isDark ? 'vs-dark' : 'vs';
          setTheme(newTheme);
          localStorage.setItem('editorTheme', newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      if (auth.currentUser) {
        try {
          const settingsDoc = await getDoc(doc(db, 'settings', 'editor'));
          if (settingsDoc.exists()) {
            const preference = settingsDoc.data().showOutput;
            if (preference !== undefined) {
              setShowOutput(preference);
              localStorage.setItem('showOutput', JSON.stringify(preference));
            }
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    };

    loadSettings();
  }, [user]);

  const handleShowOutputChange = async (show: boolean) => {
    setShowOutput(show);
    localStorage.setItem('showOutput', JSON.stringify(show));

    if (auth.currentUser) {
      try {
        await setDoc(
          doc(db, 'settings', 'editor'),
          {
            showOutput: show,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser.uid,
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving output preference:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setShowLoginModal(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const initWebSocket = useCallback(() => {
    try {
      const decodedIp = ip ? decode(ip) : '';
      const socket = new WebSocket(`ws://${decodedIp}:7890/Execute`);

      socket.onopen = () => {
        setIsConnected(true);
        toast.success('Connected to execution server', {
          icon: '🚀',
          position: 'bottom-right',
        });
        setOutput('Connected to execution server\n');
      };

      socket.onclose = () => {
        setIsConnected(false);
        setOutput((prev) => prev + 'Disconnected from execution server\n');

        if (!hasRetried) {
          setHasRetried(true);
          setTimeout(() => {
            initWebSocket();
          }, 5000);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.error) {
            setOutput((prev) => prev + `❌ Error: ${message.error}\n`);
            toast.error('Execution error occurred', {
              position: 'bottom-right',
            });
          } else {
            setOutput((prev) => prev + `✨ ${message}\n`);
          }
        } catch (error) {
          setOutput((prev) => prev + event.data + '\n');
        }
        setIsExecuting(false);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setOutput((prev) => prev + `WebSocket error occurred\n`);
        toast.error('Connection error', {
          position: 'bottom-right',
        });
        setIsExecuting(false);
      };

      setWs(socket);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      toast.error('Failed to initialize connection', {
        position: 'bottom-right',
      });
      setIsExecuting(false);
    }
  }, [ip, hasRetried]);

  useEffect(() => {
    initWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [initWebSocket]);

  const handleExecute = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to execution server', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      setIsExecuting(true);
      ws.send(code);
      toast.success('Code sent for execution', {
        icon: '🚀',
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error('Failed to send code', {
        position: 'bottom-right',
      });
      setIsExecuting(false);
    }
  };

  const handleClear = () => {
    setCode('// Write your code here...\nconsole.log("Hello, World!");');
    setOutput('');
    toast.success('Editor cleared', {
      icon: '🧹',
      position: 'bottom-right',
    });
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to sign out', {
        position: 'bottom-right',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        {user ? (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Sign Out
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </motion.button>
        )}
      </div>

      <motion.div
        className="fixed left-0 top-0 bottom-0 w-4 z-40 cursor-pointer"
        onHoverStart={() => setShowWorkspace(true)}
        whileHover={{
          width: '1.5rem',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
        }}
        initial={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="h-full flex items-center justify-center">
          <Menu className="w-4 h-4 text-indigo-500" />
        </div>
      </motion.div>

      <Workspace
        onClose={() => setShowWorkspace(false)}
        onInsertCode={setCode}
        isAuthenticated={!!user}
        currentCode={code}
        isOpen={showWorkspace}
        showOutput={showOutput}
        setShowOutput={handleShowOutputChange}
      />

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 dark:from-yellow-900/20 dark:to-amber-900/20 p-4"
        >
          <p className="text-center text-amber-800 dark:text-amber-200 font-medium">
            ✨ Sign in to unlock the workspace feature and save your scripts!
          </p>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Code Executor
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isConnected
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
              } shadow-md`}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {hasRetried ? 'Connection Failed' : 'Reconnecting...'}
                  </span>
                </>
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExecute}
              disabled={!isConnected || isExecuting}
              className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md hover:shadow-lg ${
                isConnected && !isExecuting
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
            </motion.button>
          </div>
        </motion.div>

        <div
          className={`grid ${
            showOutput ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          } gap-6`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div
              className={`${
                showOutput ? 'h-[600px]' : 'h-[calc(100vh-200px)]'
              } w-full`}
            >
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme={theme}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: true,
                }}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                }
              />
            </div>
          </motion.div>

          {showOutput && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Output
                </h2>
              </div>
              <pre className="p-6 h-[544px] overflow-auto font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-800/50">
                {output || '// Execution output will appear here... ✨'}
              </pre>
            </motion.div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
