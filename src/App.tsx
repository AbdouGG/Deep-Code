import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Profile } from './components/Profile';
import { CodeSnippet } from './components/CodeSnippet';
import { SunraysBackground } from './components/SunraysBackground';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { SearchBar } from './components/SearchBar';
import { CodeExecutor } from './components/CodeExecutor';
import { profile } from './data/profile';
import { Moon, Sun, Github } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { CodeSnippet as CodeSnippetType } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" />;
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [snippets, setSnippets] = useState<CodeSnippetType[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippetType[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const snippetsQuery = query(
          collection(db, 'snippets'),
          orderBy('lastUpdated', 'desc')
        );
        const querySnapshot = await getDocs(snippetsQuery);
        const snippetsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CodeSnippetType[];
        setSnippets(snippetsData);
        setFilteredSnippets(snippetsData);
      } catch (error) {
        console.error('Error loading snippets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSnippets();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = snippets.filter((snippet) => {
      const searchableContent = [
        snippet.title,
        snippet.description,
        snippet.code,
        ...snippet.tags,
        snippet.language,
      ]
        .join(' ')
        .toLowerCase();
      return searchableContent.includes(query);
    });
    setFilteredSnippets(filtered);
  }, [searchQuery, snippets]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/executor/:ip" element={<CodeExecutor />} />
        <Route
          path="/"
          element={
            <div
              className={`min-h-screen bg-gray-50/80 dark:bg-gray-900/80 transition-colors duration-200`}
            >
              <SunraysBackground isDark={isDark} />

              <nav className="bg-white/80 dark:bg-gray-800/80 shadow-sm backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    Code Portfolio
                  </h1>
                  <div className="flex items-center space-x-4">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {isDark ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </nav>

              <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Profile profile={profile} />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Code Snippets
                    </h2>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  </div>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                    </div>
                  ) : filteredSnippets.length > 0 ? (
                    filteredSnippets.map((snippet) => (
                      <CodeSnippet key={snippet.id} snippet={snippet} />
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-12">
                      {searchQuery
                        ? 'No matching snippets found.'
                        : 'No code snippets available yet.'}
                    </p>
                  )}
                </div>
              </main>

              <footer className="bg-white/80 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    © {new Date().getFullYear()} Code Portfolio. All rights
                    reserved.
                  </p>
                </div>
              </footer>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
