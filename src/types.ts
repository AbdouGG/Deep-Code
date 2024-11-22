export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  version: string;
  lastUpdated: string;
  changes: ChangeLog[];
  previewImage?: string;
}

export interface ChangeLog {
  version: string;
  date: string;
  changes: string[];
}

export interface Profile {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  background: string;
  avatar: string;
}
