import React, { useState, useEffect } from 'react';
import {
  Save,
  Upload,
  KeyRound,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Trash2
} from 'lucide-react';
import { ProfileData, ServiceItem } from '../../types';
import { api } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // CV Upload state
  const [cvUploading, setCvUploading] = useState(false);
  const [cvMessage, setCvMessage] = useState<string | null>(null);

  // Skills input helper
  const [skillsText, setSkillsText] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.adminGetSettings();
      setProfile(data.profile);
      setServices(data.services || []);
      if (data.profile?.skills) {
        setSkillsText(data.profile.skills.join(', '));
      }
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaveStatus(null);
    setSaveError(null);

    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updatedProfile: ProfileData = {
      ...profile,
      skills: skillsArray
    };

    try {
      await api.adminUpdateSettings({ profile: updatedProfile, services });
      setProfile(updatedProfile);
      setSaveStatus('Profile settings saved successfully.');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings.');
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('CV file must be a PDF document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setCvUploading(true);
    setCvMessage(null);
    try {
      const res = await api.adminUploadCV(file);
      setCvMessage('CV uploaded successfully!');
      if (profile) {
        setProfile({ ...profile, cvUrl: res.cvUrl });
      }
    } catch (err: any) {
      alert(err.message || 'CV upload failed.');
    } finally {
      setCvUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.adminChangePassword(currentPassword, newPassword);
      setPasswordStatus('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4 text-center py-12">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          Failed to Load Settings
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          {loadError || 'Unable to retrieve settings. Your admin session may have expired.'}
        </p>
        <button
          type="button"
          onClick={loadSettings}
          className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-lg hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Profile & System Settings
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage your public brand identity, contact links, resume document, and account security.
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Personal & Brand Details
              </h2>
              <p className="text-xs text-stone-500">
                Appears on the homepage, about page, and footer.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          {saveStatus && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Avatar Photo Preview & Path */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shrink-0 shadow-xs">
              <img
                src={profile.avatarUrl || '/assets/aistudio/sudip_3f6de287.jpeg'}
                alt="Profile Avatar Preview"
                className="w-full h-full object-cover object-[center_15%]"
              />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="block text-xs font-semibold">Profile Photo / Avatar Path</label>
              <input
                type="text"
                value={profile.avatarUrl || ''}
                onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
                placeholder="/assets/aistudio/sudip_3f6de287.jpeg"
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121215] focus:outline-none"
              />
              <p className="text-[11px] text-stone-500">
                Displayed on the About Me page, homepage intro, and WhatsApp contact popup.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Professional Title *</label>
              <input
                type="text"
                required
                value={profile.professionalTitle}
                onChange={e => setProfile({ ...profile, professionalTitle: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Primary Email *</label>
              <input
                type="email"
                required
                value={profile.primaryEmail}
                onChange={e => setProfile({ ...profile, primaryEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">WhatsApp Number *</label>
              <input
                type="text"
                required
                value={profile.whatsAppNumber}
                onChange={e => setProfile({ ...profile, whatsAppNumber: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Homepage Hero Heading *</label>
            <input
              type="text"
              required
              value={profile.heroHeading}
              onChange={e => setProfile({ ...profile, heroHeading: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Homepage Supporting Text *</label>
            <textarea
              rows={2}
              required
              value={profile.heroSubheading}
              onChange={e => setProfile({ ...profile, heroSubheading: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Professional Introduction & Biography *</label>
            <textarea
              rows={4}
              required
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Design & Strategy Approach</label>
              <textarea
                rows={3}
                value={profile.approach}
                onChange={e => setProfile({ ...profile, approach: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Professional Goals</label>
              <textarea
                rows={3}
                value={profile.goals}
                onChange={e => setProfile({ ...profile, goals: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Core Skills (Comma-separated)</label>
            <input
              type="text"
              value={skillsText}
              onChange={e => setSkillsText(e.target.value)}
              placeholder="Graphic Design, UI/UX Design, Branding..."
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
            />
          </div>
        </div>
      </form>

      {/* CV Document Management Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Curriculum Vitae (CV) PDF</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload your latest PDF resume. Visitors will be able to download and view it from the /resume page.
          </p>
        </div>

        {cvMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs">
            {cvMessage}
          </div>
        )}

        <div className="p-5 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              {profile.cvUrl ? 'Current CV Document Active' : 'No custom PDF uploaded yet'}
            </div>
            <p className="text-[11px] text-stone-500">
              {profile.cvUrl ? `Active path: ${profile.cvUrl}` : 'Accepts PDF files up to 10MB'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Test View</span>
              </a>
            )}

            <label className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              {cvUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{cvUploading ? 'Uploading...' : 'Upload New PDF'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleCvUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-stone-500" />
            <span>Change Administrator Password</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Passwords are hashed using bcrypt with salt. Minimum 8 characters.
          </p>
        </div>

        {passwordStatus && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs">
            {passwordStatus}
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-800 dark:text-red-300 text-xs">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};
