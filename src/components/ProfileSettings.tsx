import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Profile } from '../types';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileSettingsProps {
  onClose: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    role: '',
    bio: '',
    skills: [],
    background: '',
    avatar: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileDoc = await getDoc(doc(db, 'settings', 'profile'));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as Profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      toast.error('You must be logged in to update profile settings');
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'profile'), {
        ...profile,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser.uid,
      });
      toast.success('Profile settings saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile settings');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Portfolio Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <input
            type="text"
            value={profile.role}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Your Role"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Profile Image URL
          </label>
          <input
            type="url"
            value={profile.avatar}
            onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
          {profile.avatar && (
            <div className="mt-2">
              <img
                src={profile.avatar}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://via.placeholder.com/160?text=Invalid+URL';
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            About Me
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Write a brief bio about yourself"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Professional Background
          </label>
          <textarea
            value={profile.background}
            onChange={(e) =>
              setProfile({ ...profile, background: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Describe your professional background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Skills & Expertise
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm flex items-center"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
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
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add a skill"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
