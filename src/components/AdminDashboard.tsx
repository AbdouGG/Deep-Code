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
import { Plus, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { CodeSnippet } from '../types';
import { SnippetForm } from './SnippetForm';
import { SnippetView } from './SnippetView';
import { ProfileSettings } from './ProfileSettings';

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
  const [editForm, setEditForm] =
    useState<Omit<CodeSnippet, 'id'>>(defaultSnippetForm);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <ProfileSettings onClose={() => setShowSettings(false)} />
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditForm(defaultSnippetForm);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Snippet</span>
              </button>
            </div>

            {isAdding && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Snippet
                </h2>
                <SnippetForm
                  editForm={editForm}
                  setEditForm={setEditForm}
                  newTag={newTag}
                  setNewTag={setNewTag}
                  onSubmit={handleAddSnippet}
                  onCancel={() => {
                    setIsAdding(false);
                    setEditForm(defaultSnippetForm);
                  }}
                />
              </div>
            )}

            <div className="space-y-6">
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  {isEditing === snippet.id ? (
                    <SnippetForm
                      editForm={editForm}
                      setEditForm={setEditForm}
                      newTag={newTag}
                      setNewTag={setNewTag}
                      onSubmit={() => handleUpdateSnippet(snippet.id)}
                      onCancel={() => {
                        setIsEditing(null);
                        setEditForm(defaultSnippetForm);
                      }}
                    />
                  ) : (
                    <SnippetView
                      snippet={snippet}
                      onEdit={() => {
                        setIsEditing(snippet.id);
                        setEditForm(snippet);
                      }}
                      onDelete={() => handleDeleteSnippet(snippet.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
