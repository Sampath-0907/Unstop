import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Images, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Lock, 
  LogOut, 
  Check, 
  X, 
  Upload, 
  Download, 
  RotateCcw, 
  ExternalLink,
  MapPin,
  Clock,
  Trophy,
  Sparkles,
  AlertCircle,
  Tag,
  Loader2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  Star
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ImageUploader } from './ImageUploader';
import { uploadImageToCloudinary } from '../utils/cloudinary';

export const Admin = ({ onNavigateToSite }) => {
  const {
    events,
    gallery,
    team,
    isAuthenticated,
    login,
    logout,
    updatePasscode,
    addEvent,
    updateEvent,
    deleteEvent,
    reorderEvents,
    moveEvent,
    pinToTopEvent,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    reorderGallery,
    moveGallery,
    pinToTopGallery,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    reorderTeam,
    moveTeam,
    pinToTopTeam,
    resetToDefaults,
    exportAllDataJSON,
    importAllDataJSON,
    cloudinaryConfig,
  } = useData();

  // Login form state
  const [inputPasscode, setInputPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('events');

  // Image upload loading state
  const [isEventPhotoUploading, setIsEventPhotoUploading] = useState(false);
  const [isGalleryPhotoUploading, setIsGalleryPhotoUploading] = useState(false);

  // Modals state
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [editingGallery, setEditingGallery] = useState(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const [editingMember, setEditingMember] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, title }
  const [toastMessage, setToastMessage] = useState('');

  // Passcode update state
  const [newPasscode, setNewPasscode] = useState('');
  const [importJsonText, setImportJsonText] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (login(inputPasscode)) {
      setLoginError(false);
      setInputPasscode('');
    } else {
      setLoginError(true);
    }
  };

  // ============================================================================
  // EVENT FORM HANDLERS
  // ============================================================================
  const initialEventState = {
    title: '',
    category: 'Workshops',
    status: 'Upcoming',
    date: '',
    time: '',
    location: '',
    mode: 'In-Person',
    participants: '',
    prizePool: '',
    description: '',
    image: '',
    images: [],
    tags: '',
    featured: false,
    registrationOpen: true,
    link: '#',
  };

  const [eventForm, setEventForm] = useState(initialEventState);
  const [newImageObj, setNewImageObj] = useState({ url: '', caption: '' });

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm(initialEventState);
    setNewImageObj({ url: '', caption: '' });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (ev) => {
    setEditingEvent(ev);
    setEventForm({
      ...ev,
      tags: Array.isArray(ev.tags) ? ev.tags.join(', ') : ev.tags || '',
      images: Array.isArray(ev.images) ? ev.images : [],
    });
    setNewImageObj({ url: '', caption: '' });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    const tagArray = eventForm.tags
      ? eventForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const formattedImages = (eventForm.images || []).map((img) =>
      typeof img === 'string' ? { url: img, caption: '' } : img
    );

    const payload = {
      ...eventForm,
      image: eventForm.image || (formattedImages[0]?.url || '/Events/Seminar Aug 22 2026.jpeg'),
      images: formattedImages,
      tags: tagArray,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, payload);
      showToast('Event updated successfully!');
    } else {
      addEvent(payload);
      showToast('New event created successfully!');
    }
    setIsEventModalOpen(false);
  };

  const addImageToEvent = () => {
    if (!newImageObj.url.trim()) return;
    setEventForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), { url: newImageObj.url.trim(), caption: newImageObj.caption.trim() }],
      image: prev.image || newImageObj.url.trim(),
    }));
    setNewImageObj({ url: '', caption: '' });
  };

  const handleUploadEventPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!cloudinaryConfig?.cloudName || !cloudinaryConfig?.uploadPreset) {
      showToast('Please configure Cloudinary in Settings first!');
      return;
    }
    setIsEventPhotoUploading(true);
    try {
      const res = await uploadImageToCloudinary(file, cloudinaryConfig.cloudName, cloudinaryConfig.uploadPreset);
      setEventForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), { url: res.url, caption: file.name.replace(/\.[^/.]+$/, "") }],
        image: prev.image || res.url,
      }));
      showToast('Photo uploaded to Cloudinary!');
    } catch (err) {
      showToast('Upload failed: ' + err.message);
    } finally {
      setIsEventPhotoUploading(false);
      e.target.value = '';
    }
  };

  const removeImageFromEvent = (index) => {
    setEventForm((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0]?.url || prev.image,
      };
    });
  };

  // ============================================================================
  // GALLERY FORM HANDLERS
  // ============================================================================
  const initialGalleryState = {
    title: '',
    category: 'Workshops',
    date: '',
    description: '',
    image: '',
    images: [],
  };

  const [galleryForm, setGalleryForm] = useState(initialGalleryState);
  const [newGalleryPhotoUrl, setNewGalleryPhotoUrl] = useState('');

  const openAddGallery = () => {
    setEditingGallery(null);
    setGalleryForm(initialGalleryState);
    setNewGalleryPhotoUrl('');
    setIsGalleryModalOpen(true);
  };

  const openEditGallery = (item) => {
    setEditingGallery(item);
    setGalleryForm({
      ...item,
      images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
    });
    setNewGalleryPhotoUrl('');
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallery = (e) => {
    e.preventDefault();
    const imgs = galleryForm.images || [];
    const payload = {
      ...galleryForm,
      image: galleryForm.image || imgs[0] || '/Events/In 1.JPG',
      images: imgs.length > 0 ? imgs : (galleryForm.image ? [galleryForm.image] : []),
    };

    if (editingGallery) {
      updateGalleryItem(editingGallery.id, payload);
      showToast('Gallery album updated!');
    } else {
      addGalleryItem(payload);
      showToast('Gallery album added!');
    }
    setIsGalleryModalOpen(false);
  };

  const addPhotoToGallery = () => {
    if (!newGalleryPhotoUrl.trim()) return;
    setGalleryForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), newGalleryPhotoUrl.trim()],
      image: prev.image || newGalleryPhotoUrl.trim(),
    }));
    setNewGalleryPhotoUrl('');
  };

  const handleUploadGalleryPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!cloudinaryConfig?.cloudName || !cloudinaryConfig?.uploadPreset) {
      showToast('Please configure Cloudinary in Settings first!');
      return;
    }
    setIsGalleryPhotoUploading(true);
    try {
      const res = await uploadImageToCloudinary(file, cloudinaryConfig.cloudName, cloudinaryConfig.uploadPreset);
      setGalleryForm((prev) => {
        const nextImgs = [...(prev.images || []), res.url];
        return {
          ...prev,
          images: nextImgs,
          image: prev.image || res.url,
        };
      });
      showToast('Gallery photo uploaded to Cloudinary!');
    } catch (err) {
      showToast('Upload failed: ' + err.message);
    } finally {
      setIsGalleryPhotoUploading(false);
      e.target.value = '';
    }
  };

  const removePhotoFromGallery = (index) => {
    setGalleryForm((prev) => {
      const nextImgs = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImgs,
        image: nextImgs[0] || prev.image,
      };
    });
  };

  // ============================================================================
  // TEAM FORM HANDLERS
  // ============================================================================
  const initialTeamState = {
    name: '',
    position: '',
    image: '',
    objectPosition: 'center',
    linkedin: '',
    accentColor: 'blue',
  };

  const [teamForm, setTeamForm] = useState(initialTeamState);

  const openAddTeam = () => {
    setEditingMember(null);
    setTeamForm(initialTeamState);
    setIsTeamModalOpen(true);
  };

  const openEditTeam = (mem) => {
    setEditingMember(mem);
    setTeamForm({ ...mem });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = (e) => {
    e.preventDefault();
    if (editingMember) {
      updateTeamMember(editingMember.id, teamForm);
      showToast('Team member updated!');
    } else {
      addTeamMember(teamForm);
      showToast('Team member added!');
    }
    setIsTeamModalOpen(false);
  };

  // ============================================================================
  // DELETE CONFIRMATION HANDLER
  // ============================================================================
  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'event') {
      deleteEvent(deleteConfirm.id);
      showToast('Event removed.');
    } else if (deleteConfirm.type === 'gallery') {
      deleteGalleryItem(deleteConfirm.id);
      showToast('Gallery item removed.');
    } else if (deleteConfirm.type === 'team') {
      deleteTeamMember(deleteConfirm.id);
      showToast('Team member removed.');
    }
    setDeleteConfirm(null);
  };

  // ============================================================================
  // BACKUP / EXPORT / IMPORT
  // ============================================================================
  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportAllDataJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `unstop_igniters_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON downloaded successfully!');
  };

  const handleImportJSON = (e) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const res = importAllDataJSON(importJsonText);
    if (res.success) {
      showToast('Data imported successfully!');
      setImportJsonText('');
    } else {
      showToast(`Import failed: ${res.error}`);
    }
  };

  const handlePasscodeChange = (e) => {
    e.preventDefault();
    if (newPasscode.trim().length < 4) {
      showToast('Passcode must be at least 4 characters');
      return;
    }
    updatePasscode(newPasscode.trim());
    setNewPasscode('');
    showToast('Admin Passcode updated successfully!');
  };

  // ============================================================================
  // AUTHENTICATION SCREEN (WHEN LOCKED)
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-white"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 p-2 shadow-inner">
              <img src="/logo.png" alt="Unstop Igniters VIIT" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              Administrator Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Unstop Igniters Club • VIIT Chapter
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Enter Admin Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  placeholder="Enter admin passcode"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              {loginError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Incorrect passcode. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-end text-xs text-slate-500">
            <button
              onClick={onNavigateToSite}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              ← Back to Site
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // MAIN DASHBOARD INTERFACE
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-blue-600 text-white shadow-2xl font-bold text-sm flex items-center gap-2 border border-blue-400"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-700 overflow-hidden shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Unstop <span className="text-blue-400">Igniters</span> <span className="text-amber-400">VIIT</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToSite}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">View Live Website</span>
          </button>

          <button
            onClick={logout}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="Lock & Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container - Full Fluid Screen Width */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 flex-1 flex flex-col">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between overflow-x-auto pb-4 mb-8 border-b border-slate-800 gap-2 scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Events ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>Gallery ({gallery.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Core Team ({team.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Backup & Settings</span>
            </button>
          </div>

          {/* Quick Create Button */}
          {activeTab === 'events' && (
            <button
              onClick={openAddEvent}
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-yellow-400/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}

          {activeTab === 'gallery' && (
            <button
              onClick={openAddGallery}
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-yellow-400/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Album</span>
            </button>
          )}

          {activeTab === 'team' && (
            <button
              onClick={openAddTeam}
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-yellow-400/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* TAB 1: EVENTS MANAGEMENT */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {events.map((ev, idx) => {
                const imgCount = (ev.images && ev.images.length) || (ev.image ? 1 : 0);
                return (
                  <div
                    key={ev.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg group hover:border-slate-700 transition-colors"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={ev.image || '/Events/Seminar Aug 22 2026.jpeg'}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            idx === 0 
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                              : 'bg-slate-950/80 text-slate-300 border border-slate-700'
                          }`}>
                            {idx === 0 ? '★ #1 (First)' : `#${idx + 1}`}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            {ev.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-slate-200 backdrop-blur-xs">
                            {imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-base text-white mb-2 line-clamp-1">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                          {ev.description}
                        </p>

                        <div className="space-y-1.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{ev.date || 'TBD'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">{ev.location || 'VIIT Campus'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Reorder Footer */}
                    <div className="p-3.5 px-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                      {/* Move Order Controls */}
                      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              pinToTopEvent(ev.id);
                              showToast(`Pinned "${ev.title}" to #1 (First on Website)!`);
                            }}
                            className="p-1.5 rounded-lg hover:bg-amber-400/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                            title="Make #1 on Website"
                          >
                            <ChevronsUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            moveEvent(idx, 'up');
                            showToast(`Moved "${ev.title}" forward.`);
                          }}
                          disabled={idx === 0}
                          className={`p-1.5 rounded-lg transition-colors ${
                            idx === 0
                              ? 'text-slate-700 cursor-not-allowed'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer'
                          }`}
                          title="Move Earlier in List"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            moveEvent(idx, 'down');
                            showToast(`Moved "${ev.title}" backward.`);
                          }}
                          disabled={idx === events.length - 1}
                          className={`p-1.5 rounded-lg transition-colors ${
                            idx === events.length - 1
                              ? 'text-slate-700 cursor-not-allowed'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer'
                          }`}
                          title="Move Later in List"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditEvent(ev)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'event', id: ev.id, title: ev.title })}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {gallery.map((item, idx) => {
              const imgs = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg group hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                      <img
                        src={item.image || imgs[0] || '/Events/In 1.JPG'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          idx === 0 
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                            : 'bg-slate-950/80 text-slate-300 border border-slate-700'
                        }`}>
                          {idx === 0 ? '★ #1 (First)' : `#${idx + 1}`}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-slate-200 backdrop-blur-xs">
                          {imgs.length} Photos
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-base text-white mb-1.5 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-yellow-400 font-medium mb-2">{item.date}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions & Reorder Footer */}
                  <div className="p-3.5 px-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                    {/* Move Order Controls */}
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                      {idx > 0 && (
                        <button
                          onClick={() => {
                            pinToTopGallery(item.id);
                            showToast(`Pinned "${item.title}" to #1 (First on Website)!`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-amber-400/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                          title="Make #1 on Website"
                        >
                          <ChevronsUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          moveGallery(idx, 'up');
                          showToast(`Moved "${item.title}" forward.`);
                        }}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg transition-colors ${
                          idx === 0
                            ? 'text-slate-700 cursor-not-allowed'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer'
                        }`}
                        title="Move Earlier in List"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          moveGallery(idx, 'down');
                          showToast(`Moved "${item.title}" backward.`);
                        }}
                        disabled={idx === gallery.length - 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          idx === gallery.length - 1
                            ? 'text-slate-700 cursor-not-allowed'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer'
                        }`}
                        title="Move Later in List"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditGallery(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'gallery', id: item.id, title: item.title })}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: TEAM MANAGEMENT */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5">
            {team.map((mem, idx) => (
              <div
                key={mem.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 flex flex-col items-center justify-between text-center shadow-lg group hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800 flex items-center justify-center">
                    <img
                      src={mem.image}
                      alt={mem.name}
                      style={{ objectPosition: mem.objectPosition || 'center' }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        idx === 0 
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                          : 'bg-slate-950/80 text-slate-300 border border-slate-700'
                      }`}>
                        {idx === 0 ? '★ Lead' : `#${idx + 1}`}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-1 text-center">{mem.name}</h3>
                  <p className="text-xs text-blue-400 font-medium line-clamp-1 mb-2 text-center">{mem.position}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2 w-full">
                  {/* Move Team Order Buttons */}
                  <div className="flex items-center justify-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 w-full">
                    {idx > 0 && (
                      <button
                        onClick={() => {
                          pinToTopTeam(mem.id);
                          showToast(`Pinned "${mem.name}" to #1 (Lead position)!`);
                        }}
                        className="p-1 rounded-lg hover:bg-amber-400/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Make #1 Lead"
                      >
                        <ChevronsUp className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        moveTeam(idx, 'up');
                        showToast(`Moved "${mem.name}" forward.`);
                      }}
                      disabled={idx === 0}
                      className={`p-1 rounded-lg transition-colors ${
                        idx === 0 ? 'text-slate-700' : 'hover:bg-slate-800 text-slate-300 cursor-pointer'
                      }`}
                      title="Move Forward"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        moveTeam(idx, 'down');
                        showToast(`Moved "${mem.name}" backward.`);
                      }}
                      disabled={idx === team.length - 1}
                      className={`p-1 rounded-lg transition-colors ${
                        idx === team.length - 1 ? 'text-slate-700' : 'hover:bg-slate-800 text-slate-300 cursor-pointer'
                      }`}
                      title="Move Backward"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-slate-500">#{mem.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditTeam(mem)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'team', id: mem.id, title: mem.name })}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SETTINGS & DATA BACKUP */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">

            {/* Passcode Setting Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Lock className="w-5 h-5 text-yellow-400" />
                <span>Admin Passcode</span>
              </h3>
              <p className="text-xs text-slate-400">
                Change the passcode used to unlock this administrative management portal.
              </p>

              <form onSubmit={handlePasscodeChange} className="space-y-3 pt-2">
                <input
                  type="text"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode (min 4 chars)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Update Passcode
                </button>
              </form>
            </div>

            {/* Reset Defaults Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <span>Reset Data to Defaults</span>
              </h3>
              <p className="text-xs text-slate-400">
                Restore all events, gallery pictures, and team leads back to the default initial codebase data.
              </p>

              <div className="pt-6">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all data to default? This will clear custom additions stored in browser storage.')) {
                      resetToDefaults();
                      showToast('Data reset to default values!');
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset All Data to Defaults
                </button>
              </div>
            </div>

            {/* Export Backup Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 md:col-span-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <Download className="w-5 h-5 text-emerald-400" />
                <span>Export & Import JSON Backup</span>
              </h3>
              <p className="text-xs text-slate-400">
                Export all your customized events, gallery photos, and team leads into a single backup JSON file, or paste a backup to restore it.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleDownloadBackup}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File (.json)</span>
                </button>
              </div>

              <form onSubmit={handleImportJSON} className="pt-4 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Import Backup JSON:
                </label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON backup content here..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Import JSON
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================
          EVENT EDITOR MODAL
         ======================================================================== */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEventModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-white z-10 my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-xl font-bold font-display text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-5">
                {/* Event Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. HackUnstop 36H Hackathon 2026"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 2-col Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Category *</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Workshops">Workshops</option>
                      <option value="Competitions">Competitions</option>
                      <option value="Hackathons">Hackathons</option>
                      <option value="Seminars">Seminars</option>
                      <option value="Innovation">Innovation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Status *</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Date, Time, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Date</label>
                    <input
                      type="text"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      placeholder="e.g. Oct 24, 2026"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Time</label>
                    <input
                      type="text"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      placeholder="e.g. 10:00 AM IST"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g. Auditorium / SA 13"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Mode, Participants, PrizePool */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Mode</label>
                    <select
                      value={eventForm.mode}
                      onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="In-Person">In-Person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Participants</label>
                    <input
                      type="text"
                      value={eventForm.participants}
                      onChange={(e) => setEventForm({ ...eventForm, participants: e.target.value })}
                      placeholder="e.g. 150+ Students"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Prize / Benefit</label>
                    <input
                      type="text"
                      value={eventForm.prizePool}
                      onChange={(e) => setEventForm({ ...eventForm, prizePool: e.target.value })}
                      placeholder="e.g. ₹50,000 / Certificates"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Comprehensive description of what happens in this event..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={eventForm.tags}
                    onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
                    placeholder="e.g. AI, Full-Stack, Web Security, Hackathon"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Cover Image with Cloudinary */}
                <ImageUploader
                  label="Event Cover Image"
                  value={eventForm.image}
                  onChange={(url) => setEventForm({ ...eventForm, image: url })}
                  placeholder="/Events/ws1.jpeg or https://..."
                  onOpenSettings={() => {
                    setIsEventModalOpen(false);
                    setActiveTab('settings');
                  }}
                />

                {/* Multi-Photo Manager */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider">
                      Event Photos / Moments ({eventForm.images?.length || 0})
                    </label>

                    {/* Direct Cloudinary upload button */}
                    <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isEventPhotoUploading 
                        ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    }`}>
                      {isEventPhotoUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload from Device (Cloudinary)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isEventPhotoUploading}
                        onChange={handleUploadEventPhotoFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Add multiple photos for this event. These appear in the event detail modal gallery with zoom support.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newImageObj.url}
                      onChange={(e) => setNewImageObj({ ...newImageObj, url: e.target.value })}
                      placeholder="Photo URL or /Events/ws2.jpeg"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newImageObj.caption}
                      onChange={(e) => setNewImageObj({ ...newImageObj, caption: e.target.value })}
                      placeholder="Caption (optional)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addImageToEvent}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Added Photos List */}
                  {eventForm.images && eventForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {eventForm.images.map((img, i) => {
                        const url = typeof img === 'string' ? img : img.url;
                        const caption = typeof img === 'string' ? '' : img.caption;
                        return (
                          <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImageFromEvent(i)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {caption && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-slate-200 px-1 py-0.5 truncate">
                                {caption}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================
          GALLERY EDITOR MODAL
         ======================================================================== */}
      <AnimatePresence>
        {isGalleryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGalleryModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-white z-10 my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-xl font-bold font-display text-white">
                  {editingGallery ? 'Edit Gallery Album' : 'Add Gallery Album'}
                </h3>
                <button
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Album Title *</label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    placeholder="e.g. Club Inauguration 2026"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Category *</label>
                    <select
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Inauguration">Inauguration</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Competitions">Competitions</option>
                      <option value="Hackathons">Hackathons</option>
                      <option value="Seminars">Seminars</option>
                      <option value="Team">Team</option>
                      <option value="Innovation">Innovation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Date</label>
                    <input
                      type="text"
                      value={galleryForm.date}
                      onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                      placeholder="e.g. September 26, 2026"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    placeholder="Description of the event moments..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Multi-Photo Manager */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider">
                      Gallery Photos ({galleryForm.images?.length || 0})
                    </label>

                    {/* Direct Cloudinary upload button */}
                    <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isGalleryPhotoUploading 
                        ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    }`}>
                      {isGalleryPhotoUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload from Device (Cloudinary)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isGalleryPhotoUploading}
                        onChange={handleUploadGalleryPhotoFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGalleryPhotoUrl}
                      onChange={(e) => setNewGalleryPhotoUrl(e.target.value)}
                      placeholder="Enter photo path e.g. /Events/In 2.jpeg or URL"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addPhotoToGallery}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>

                  {galleryForm.images && galleryForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {galleryForm.images.map((url, i) => (
                        <div key={i} className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhotoFromGallery(i)}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGalleryModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    Save Album
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================
          TEAM MEMBER EDITOR MODAL
         ======================================================================== */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTeamModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-white z-10 my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-xl font-bold font-display text-white">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTeam} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Member Name *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    placeholder="e.g. Panga Anjan"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Role / Position *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.position}
                    onChange={(e) => setTeamForm({ ...teamForm, position: e.target.value })}
                    placeholder="e.g. Chapter Lead / Web Dev Lead"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Profile Photo with Cloudinary */}
                <ImageUploader
                  label="Profile Photo"
                  value={teamForm.image}
                  onChange={(url) => setTeamForm({ ...teamForm, image: url })}
                  placeholder="e.g. /team/Lead 1.jpeg or https://..."
                  aspectRatio="avatar"
                  onOpenSettings={() => {
                    setIsTeamModalOpen(false);
                    setActiveTab('settings');
                  }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Object Position</label>
                    <input
                      type="text"
                      value={teamForm.objectPosition}
                      onChange={(e) => setTeamForm({ ...teamForm, objectPosition: e.target.value })}
                      placeholder="e.g. 50% 20% or center"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Accent Color</label>
                    <select
                      value={teamForm.accentColor}
                      onChange={(e) => setTeamForm({ ...teamForm, accentColor: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="blue">Blue</option>
                      <option value="yellow">Yellow</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">LinkedIn Profile Link</label>
                  <input
                    type="url"
                    value={teamForm.linkedin}
                    onChange={(e) => setTeamForm({ ...teamForm, linkedin: e.target.value })}
                    placeholder="https://www.linkedin.com/in/..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================
          DELETE CONFIRMATION MODAL
         ======================================================================== */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-1">Confirm Deletion</h4>
              <p className="text-xs text-slate-400 mb-6">
                Are you sure you want to remove <span className="font-semibold text-white">"{deleteConfirm.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
