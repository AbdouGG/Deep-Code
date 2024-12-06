import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  LogOut,
  Settings,
  Search,
  Code2,
  LayoutGrid,
  List,
  Trash2,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CodeSnippet } from '../types';
import { SnippetForm } from './SnippetForm';
import { SnippetView } from './SnippetView';
import { ProfileSettings } from './ProfileSettings';
import { motion, AnimatePresence } from 'framer-motion';

const defaultSnippetForm: Omit<CodeSnippet, 'id'> = {
  title: '',
  description: '',
  code: '',
  language: 'typescript',
  tags: [],
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  changes: [
    {
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Initial version'],
    },
  ],
};

export function AdminDashboard() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Omit<CodeSnippet, 'id'>>(defaultSnippetForm);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/admin');
      } else {
        loadSnippets();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadSnippets = async () => {
    try {
      setIsLoading(true);
      const snippetsQuery = query(
        collection(db, 'snippets'),
        orderBy('lastUpdated', 'desc')
      );
      const querySnapshot = await getDocs(snippetsQuery);
      const snippetsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CodeSnippet[];
      setSnippets(snippetsData);
    } catch (error) {
      console.error('Error loading snippets:', error);
      toast.error('Failed to load snippets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleAddSnippet = async () => {
    if (!auth.currentUser) {
      toast.error('You must be logged in to add snippets');
      return;
    }

    try {
      const newSnippet = {
        ...editForm,
        lastUpdated: new Date().toISOString(),
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'snippets'), newSnippet);
      toast.success('Snippet added successfully');
      setIsAdding(false);
      setEditForm(defaultSnippetForm);
      loadSnippets();
    } catch (error) {
      console.error('Error adding snippet:', error);
      toast.error('Failed to add snippet');
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!auth.currentUser) {
      toast.error('You must be logged in to delete snippets');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'snippets', id));
      toast.success('Snippet deleted successfully');
      loadSnippets();
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast.error('Failed to delete snippet');
    }
  };

  const handleUpdateSnippet = async (id: string) => {
    if (!auth.currentUser) {
      toast.error('You must be logged in to update snippets');
      return;
    }

    try {
      const updatedSnippet = {
        ...editForm,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser.uid,
      };
      await updateDoc(doc(db, 'snippets', id), updatedSnippet);
      toast.success('Snippet updated successfully');
      setIsEditing(null);
      loadSnippets();
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast.error('Failed to update snippet');
    }
  };

  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Code2 className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Code Portfolio
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <ProfileSettings onClose={() => setShowSettings(false)} />
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 sm:flex-none sm:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search snippets..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditForm(defaultSnippetForm);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Snippet</span>
              </button>
            </div>

            {/* Add/Edit Form Modal */}
            <AnimatePresence>
              {(isAdding || isEditing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isAdding ? 'Add New Snippet' : 'Edit Snippet'}
                      </h2>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setIsEditing(null);
                          setEditForm(defaultSnippetForm);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      <SnippetForm
                        editForm={editForm}
                        setEditForm={setEditForm}
                        newTag=""
                        setNewTag={() => {}}
                        onSubmit={() =>
                          isAdding
                            ? handleAddSnippet()
                            : isEditing && handleUpdateSnippet(isEditing)
                        }
                        onCancel={() => {
                          setIsAdding(false);
                          setIsEditing(null);
                          setEditForm(defaultSnippetForm);
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Snippets Grid/List */}
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-12">
                <Code2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No snippets found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first snippet'}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }
              >
                {filteredSnippets.map((snippet) => (
                  <motion.div
                    key={snippet.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {snippet.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {snippet.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setIsEditing(snippet.id);
                              setEditForm(snippet);
                            }}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSnippet(snippet.id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {snippet.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {new Date(snippet.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}