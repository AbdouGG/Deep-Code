import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Briefcase, Cpu } from 'lucide-react';
import { Profile as ProfileType } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ProfileProps {
  profile: ProfileType;
}

export function Profile({ profile: initialProfile }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileType>(initialProfile);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'settings', 'profile'));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as ProfileType);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8"
    >
      <div className="flex items-center space-x-6">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://via.placeholder.com/160?text=Profile';
          }}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {profile.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {profile.role}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex items-start space-x-3">
          <Code2 className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              About Me
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Briefcase className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Professional Background
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {profile.background}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Cpu className="w-6 h-6 text-indigo-500 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
