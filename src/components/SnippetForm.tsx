import React from 'react';
import { X, Plus, Trash2, Image } from 'lucide-react';
import { CodeSnippet, ChangeLog } from '../types';

interface SnippetFormProps {
  editForm: Omit<CodeSnippet, 'id'>;
  setEditForm: (form: Omit<CodeSnippet, 'id'>) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function SnippetForm({
  editForm,
  setEditForm,
  newTag,
  setNewTag,
  onSubmit,
  onCancel,
}: SnippetFormProps) {
  const [newChange, setNewChange] = React.useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !editForm.tags.includes(newTag.trim())) {
      setEditForm({
        ...editForm,
        tags: [...editForm.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddChange = () => {
    if (newChange.trim()) {
      const currentChangelog = editForm.changes[0];
      setEditForm({
        ...editForm,
        changes: [
          {
            ...currentChangelog,
            changes: [...currentChangelog.changes, newChange.trim()],
          },
          ...editForm.changes.slice(1),
        ],
      });
      setNewChange('');
    }
  };

  const handleRemoveChange = (changeIndex: number) => {
    const currentChangelog = editForm.changes[0];
    setEditForm({
      ...editForm,
      changes: [
        {
          ...currentChangelog,
          changes: currentChangelog.changes.filter(
            (_, index) => index !== changeIndex
          ),
        },
        ...editForm.changes.slice(1),
      ],
    });
  };

  const handleVersionChange = (newVersion: string) => {
    if (newVersion !== editForm.version) {
      setEditForm({
        ...editForm,
        version: newVersion,
        changes: [
          {
            version: newVersion,
            date: new Date().toISOString(),
            changes: [],
          },
          ...editForm.changes,
        ],
      });
    }
  };

  const handleRemoveVersion = (versionIndex: number) => {
    if (versionIndex === 0) return; // Don't remove current version
    setEditForm({
      ...editForm,
      changes: editForm.changes.filter((_, index) => index !== versionIndex),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Title"
        />
        <textarea
          value={editForm.description}
          onChange={(e) =>
            setEditForm({ ...editForm, description: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg h-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Description"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preview Image URL
          </label>
          <div className="flex gap-4">
            <input
              type="url"
              value={editForm.previewImage || ''}
              onChange={(e) =>
                setEditForm({ ...editForm, previewImage: e.target.value })
              }
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
            {editForm.previewImage && (
              <div className="relative w-[120px] h-[80px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={editForm.previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src =
                      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&h=120&q=80';
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <textarea
          value={editForm.code}
          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg h-40 font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Code"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <select
            value={editForm.language}
            onChange={(e) =>
              setEditForm({ ...editForm, language: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Version
          </label>
          <input
            type="text"
            value={editForm.version}
            onChange={(e) => handleVersionChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="1.0.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {editForm.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add a tag"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg"
            >
              Add Tag
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Changes for version {editForm.version}
          </label>
          <div className="space-y-2 mb-2">
            {editForm.changes[0]?.changes.map((change, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 text-gray-700 dark:text-gray-300">
                  {change}
                </span>
                <button
                  onClick={() => handleRemoveChange(index)}
                  className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChange}
              onChange={(e) => setNewChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddChange()}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add a change"
            />
            <button
              onClick={handleAddChange}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Change
            </button>
          </div>
        </div>

        {editForm.changes.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Previous Versions
            </label>
            <div className="space-y-4">
              {editForm.changes.slice(1).map((changelog, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg relative group"
                >
                  <button
                    onClick={() => handleRemoveVersion(index + 1)}
                    className="absolute top-2 right-2 p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Version {changelog.version}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(changelog.date).toLocaleDateString()}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {changelog.changes.map((change, changeIndex) => (
                      <li
                        key={changeIndex}
                        className="text-gray-600 dark:text-gray-300 text-sm"
                      >
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}
