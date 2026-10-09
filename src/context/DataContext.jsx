import React, { createContext, useContext, useState, useEffect } from 'react';
import { eventsData as initialEvents } from '../data/events';
import { galleryData as initialGallery } from '../data/gallery';
import { teamData as initialTeam } from '../data/team';
import { 
  initFirebase, 
  getDb, 
  getRtdb,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbRemove,
  rtdbUpdate
} from '../services/firebase';

const DataContext = createContext(null);

const STORAGE_KEYS = {
  EVENTS: 'unstop_events_data_v1',
  GALLERY: 'unstop_gallery_data_v1',
  TEAM: 'unstop_team_data_v1',
  AUTH: 'unstop_admin_auth_v1',
  PASSCODE: 'unstop_admin_passcode_v1',
  CLOUDINARY: 'unstop_admin_cloudinary_v1',
  FIREBASE: 'unstop_admin_firebase_v1',
  BANNERS: 'unstop_site_banners_v1',
};

const DEFAULT_PASSCODE = 'admin123';

const DEFAULT_CLOUDINARY = {
  cloudName: 'dskmpnuzw',
  uploadPreset: 'Unstop',
};

const DEFAULT_BANNERS = {
  heroBanner: '/hero-banner.jpg',
  aboutBanner: '/Events/team.png',
};

const DEFAULT_FIREBASE = {
  apiKey: "AIzaSyCfHhpezJRZZELNf-SoVOT8zUguZswjP8M",
  authDomain: "unstop-igniters.firebaseapp.com",
  databaseURL: "https://unstop-igniters-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "unstop-igniters",
  storageBucket: "unstop-igniters.firebasestorage.app",
  messagingSenderId: "1004179505973",
  appId: "1:1004179505973:web:c397a813b0072b1a9f027c",
  measurementId: "G-3H2BLKP8KM",
};

const isRemoteUrl = (url) => {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:'));
};

// Helper to merge baseline default items, local cached items, and remote cloud items
// Guarantees that uploaded Cloudinary images and custom orders are NEVER lost or overwritten by defaults
const mergeWithDefaults = (defaults = [], cloudItems = [], localItems = []) => {
  const map = new Map();

  // 1. Layer 1: Baseline defaults
  if (Array.isArray(defaults)) {
    defaults.forEach((item, index) => {
      map.set(String(item.id), {
        ...item,
        id: String(item.id),
        order: typeof item.order === 'number' && !isNaN(item.order) ? item.order : index,
      });
    });
  }

  // 2. Layer 2: Local storage items (retains user uploads & local edits across tabs/sessions)
  if (Array.isArray(localItems)) {
    localItems.forEach((localItem) => {
      if (!localItem || typeof localItem !== 'object') return;
      const id = String(localItem.id);
      if (localItem._deleted) {
        map.delete(id);
      } else {
        const existing = map.get(id) || {};
        const chosenImage = isRemoteUrl(localItem.image)
          ? localItem.image
          : (localItem.image || existing.image || '');

        const chosenImages = (Array.isArray(localItem.images) && localItem.images.length > 0)
          ? localItem.images
          : (existing.images || []);

        map.set(id, {
          ...existing,
          ...localItem,
          id: id,
          order: typeof localItem.order === 'number' && !isNaN(localItem.order) ? localItem.order : existing.order,
          image: chosenImage,
          images: chosenImages,
        });
      }
    });
  }

  // 3. Layer 3: Cloud Firestore items (authoritative cloud sync)
  if (Array.isArray(cloudItems)) {
    cloudItems.forEach((cloudItem) => {
      if (!cloudItem || typeof cloudItem !== 'object') return;
      const id = String(cloudItem.id);
      if (cloudItem._deleted) {
        map.delete(id);
      } else {
        const existing = map.get(id) || {};

        // Preserve order
        const finalOrder = (typeof cloudItem.order === 'number' && !isNaN(cloudItem.order))
          ? cloudItem.order
          : ((typeof existing.order === 'number' && !isNaN(existing.order)) ? existing.order : map.size);

        // Preserve image: Cloud remote > Local remote > Cloud explicit > Local explicit
        let finalImage = existing.image || '';
        if (isRemoteUrl(cloudItem.image)) {
          finalImage = cloudItem.image;
        } else if (isRemoteUrl(existing.image)) {
          finalImage = existing.image;
        } else if (cloudItem.image && String(cloudItem.image).trim() !== '') {
          finalImage = cloudItem.image;
        }

        // Preserve images array for events & gallery
        let finalImages = existing.images || [];
        if (Array.isArray(cloudItem.images) && cloudItem.images.length > 0) {
          const hasCloudRemote = cloudItem.images.some((img) => isRemoteUrl(typeof img === 'string' ? img : img?.url));
          const hasExistingRemote = Array.isArray(existing.images) && existing.images.some((img) => isRemoteUrl(typeof img === 'string' ? img : img?.url));
          if (hasCloudRemote || !hasExistingRemote) {
            finalImages = cloudItem.images;
          }
        }

        map.set(id, {
          ...existing,
          ...cloudItem,
          id: id,
          order: finalOrder,
          image: finalImage,
          images: finalImages,
        });
      }
    });
  }

  const result = Array.from(map.values());
  // Sort strictly by .order ascending (fallback to numeric ID ascending)
  result.sort((a, b) => {
    const orderA = typeof a.order === 'number' && !isNaN(a.order) ? a.order : (Number(a.id) || 0);
    const orderB = typeof b.order === 'number' && !isNaN(b.order) ? b.order : (Number(b.id) || 0);
    if (orderA !== orderB) return orderA - orderB;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });

  return result;
};

export const DataProvider = ({ children }) => {
  // Local state with initial fallbacks
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithDefaults(initialEvents, [], parsed);
        }
      }
      return initialEvents.map((item, idx) => ({ order: idx, ...item }));
    } catch {
      return initialEvents.map((item, idx) => ({ order: idx, ...item }));
    }
  });

  const [gallery, setGallery] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithDefaults(initialGallery, [], parsed);
        }
      }
      return initialGallery.map((item, idx) => ({ order: idx, ...item }));
    } catch {
      return initialGallery.map((item, idx) => ({ order: idx, ...item }));
    }
  });

  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithDefaults(initialTeam, [], parsed);
        }
      }
      return initialTeam.map((item, idx) => ({ order: idx, ...item }));
    } catch {
      return initialTeam.map((item, idx) => ({ order: idx, ...item }));
    }
  });

  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return saved ? { ...DEFAULT_BANNERS, ...JSON.parse(saved) } : DEFAULT_BANNERS;
    } catch {
      return DEFAULT_BANNERS;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [passcode, setPasscode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PASSCODE) || DEFAULT_PASSCODE;
    } catch {
      return DEFAULT_PASSCODE;
    }
  });

  const [cloudinaryConfig, setCloudinaryConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLOUDINARY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          cloudName: parsed.cloudName || DEFAULT_CLOUDINARY.cloudName,
          uploadPreset: parsed.uploadPreset || DEFAULT_CLOUDINARY.uploadPreset,
        };
      }
      return DEFAULT_CLOUDINARY;
    } catch {
      return DEFAULT_CLOUDINARY;
    }
  });

  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_FIREBASE,
          ...parsed,
          databaseURL: parsed.databaseURL || DEFAULT_FIREBASE.databaseURL,
        };
      }
      return DEFAULT_FIREBASE;
    } catch {
      return DEFAULT_FIREBASE;
    }
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState({
    status: 'checking', // 'checking' | 'synced' | 'error' | 'uninitialized'
    error: null,
    lastSyncedAt: null,
    isSyncing: false,
  });

  // Sync Cloudinary to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUDINARY, JSON.stringify(cloudinaryConfig));
    } catch (e) {
      console.error('Failed to save Cloudinary settings:', e);
    }
  }, [cloudinaryConfig]);

  // Sync Firebase to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FIREBASE, JSON.stringify(firebaseConfig));
    } catch (e) {
      console.error('Failed to save Firebase settings:', e);
    }
  }, [firebaseConfig]);

  // Sync passcode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSCODE, passcode);
    } catch (e) {
      console.error('Failed to save passcode:', e);
    }
  }, [passcode]);

  // Sync data to localStorage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    } catch (e) {}
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
    } catch (e) {}
  }, [team]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    } catch (e) {}
  }, [banners]);

  // ============================================================================
  // FIREBASE REAL-TIME SYNC (REALTIME DATABASE)
  // ============================================================================
  useEffect(() => {
    if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId) {
      setIsFirebaseConnected(false);
      setCloudSyncStatus({
        status: 'uninitialized',
        error: 'Missing Firebase API Key or Project ID.',
        lastSyncedAt: null,
        isSyncing: false,
      });
      return;
    }

    const fbInit = initFirebase(firebaseConfig);
    if (!fbInit) {
      setIsFirebaseConnected(false);
      setCloudSyncStatus({
        status: 'uninitialized',
        error: 'Failed to initialize Firebase App.',
        lastSyncedAt: null,
        isSyncing: false,
      });
      return;
    }

    const { rtdb } = fbInit;
    setIsFirebaseConnected(true);

    const handleListenerError = (collName, err) => {
      console.warn(`Firebase ${collName} listener warning:`, err);
      let errMsg = err?.message || String(err);
      if (errMsg.includes('Permission denied') || errMsg.includes('PERMISSION_DENIED')) {
        errMsg = 'Permission denied by Firebase Security Rules. Please update Rules in Firebase Console (set ".read": true, ".write": true).';
      }
      setCloudSyncStatus((prev) => ({
        ...prev,
        status: 'error',
        error: errMsg,
      }));
    };

    const markSuccessSync = () => {
      setCloudSyncStatus((prev) => ({
        ...prev,
        status: 'synced',
        error: null,
        lastSyncedAt: new Date().toISOString(),
      }));
    };

    const getLocal = (key) => {
      try {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    };

    const normalizeRtdbList = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'object') return Object.values(val);
      return [];
    };

    const unsubs = [];

    // --- REALTIME DATABASE LISTENERS (Instant & Cross-Device) ---
    if (rtdb) {
      try {
        const unsubRtdbEvents = rtdbOnValue(rtdbRef(rtdb, 'events'), (snap) => {
          if (snap.exists()) {
            markSuccessSync();
            const list = normalizeRtdbList(snap.val());
            const saved = getLocal(STORAGE_KEYS.EVENTS);
            const merged = mergeWithDefaults(initialEvents, list, saved);
            setEvents(merged);
            try { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(merged)); } catch (e) {}
          }
        }, (err) => handleListenerError('RTDB Events', err));
        unsubs.push(unsubRtdbEvents);

        const unsubRtdbGallery = rtdbOnValue(rtdbRef(rtdb, 'gallery'), (snap) => {
          if (snap.exists()) {
            markSuccessSync();
            const list = normalizeRtdbList(snap.val());
            const saved = getLocal(STORAGE_KEYS.GALLERY);
            const merged = mergeWithDefaults(initialGallery, list, saved);
            setGallery(merged);
            try { localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(merged)); } catch (e) {}
          }
        }, (err) => handleListenerError('RTDB Gallery', err));
        unsubs.push(unsubRtdbGallery);

        const unsubRtdbTeam = rtdbOnValue(rtdbRef(rtdb, 'team'), (snap) => {
          if (snap.exists()) {
            markSuccessSync();
            const list = normalizeRtdbList(snap.val());
            const saved = getLocal(STORAGE_KEYS.TEAM);
            const merged = mergeWithDefaults(initialTeam, list, saved);
            setTeam(merged);
            try { localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(merged)); } catch (e) {}
          }
        }, (err) => handleListenerError('RTDB Team', err));
        unsubs.push(unsubRtdbTeam);

        const unsubRtdbBanners = rtdbOnValue(rtdbRef(rtdb, 'settings/banners'), (snap) => {
          if (snap.exists()) {
            markSuccessSync();
            const val = snap.val();
            if (val && typeof val === 'object') {
              const merged = { ...DEFAULT_BANNERS, ...val };
              setBanners(merged);
              try { localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(merged)); } catch (e) {}
            }
          }
        }, (err) => handleListenerError('RTDB Banners', err));
        unsubs.push(unsubRtdbBanners);

        const unsubRtdbSecurity = rtdbOnValue(rtdbRef(rtdb, 'settings/security'), (snap) => {
          if (snap.exists()) {
            const val = snap.val();
            if (val && typeof val === 'object' && val.passcode) {
              setPasscode(val.passcode);
              try { localStorage.setItem(STORAGE_KEYS.PASSCODE, val.passcode); } catch (e) {}
            }
          }
        }, (err) => handleListenerError('RTDB Security', err));
        unsubs.push(unsubRtdbSecurity);
      } catch (err) {
        console.warn('RTDB subscription error:', err);
      }
    }

    return () => {
      unsubs.forEach((unsub) => {
        try { unsub(); } catch (e) {}
      });
    };
  }, [firebaseConfig]);

  const updateCloudinaryConfig = (newConfig) => {
    setCloudinaryConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateFirebaseConfig = (newConfig) => {
    setFirebaseConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Test Cloud Connection (checks Realtime Database)
  const testFirestoreConnection = async () => {
    const rtdb = getRtdb();
    if (!rtdb) {
      return { success: false, error: 'Firebase is not initialized. Please verify configuration in Settings.' };
    }

    try {
      await Promise.race([
        rtdbSet(rtdbRef(rtdb, '_healthcheck/ping'), { ping: true, timestamp: new Date().toISOString() }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out. Please check network or Firebase URL.')), 4000)),
      ]);
      setCloudSyncStatus({
        status: 'synced',
        error: null,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      });
      return { success: true, backend: 'Firebase Realtime Database' };
    } catch (rtdbErr) {
      console.warn('RTDB test ping error:', rtdbErr);
      let errMsg = rtdbErr?.message || 'Connection test failed.';
      if (errMsg.includes('Permission denied') || errMsg.includes('PERMISSION_DENIED')) {
        errMsg = 'Permission denied by Firebase Security Rules. Please go to Firebase Console -> Realtime Database -> Rules and set ".read": true, ".write": true.';
      }
      setCloudSyncStatus({
        status: 'error',
        error: errMsg,
        lastSyncedAt: null,
        isSyncing: false,
      });
      return { success: false, error: errMsg };
    }
  };

  // Push / Sync All Local Data to Firebase Cloud so every device worldwide sees it
  const pushAllDataToCloud = async () => {
    const rtdb = getRtdb();
    if (!rtdb) {
      throw new Error('Firebase Realtime Database is not initialized.');
    }

    setCloudSyncStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      await Promise.race([
        Promise.all([
          rtdbSet(rtdbRef(rtdb, 'team'), team),
          rtdbSet(rtdbRef(rtdb, 'events'), events),
          rtdbSet(rtdbRef(rtdb, 'gallery'), gallery),
          banners ? rtdbSet(rtdbRef(rtdb, 'settings/banners'), banners) : Promise.resolve(),
          rtdbSet(rtdbRef(rtdb, 'settings/security'), { passcode: passcode, updatedAt: new Date().toISOString() }),
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sync operation timed out. Please check your internet connection.')), 6000)),
      ]);

      setCloudSyncStatus({
        status: 'synced',
        error: null,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      });

      return {
        success: true,
        counts: {
          team: team.length,
          events: events.length,
          gallery: gallery.length,
        },
      };
    } catch (err) {
      console.error('Cloud sync error:', err);
      let errMsg = err?.message || 'Sync failed. Please check Firebase security rules.';
      if (errMsg.includes('Permission denied') || errMsg.includes('PERMISSION_DENIED')) {
        errMsg = 'Permission denied by Firebase Security Rules. Please update Rules in Firebase Console (set ".read": true, ".write": true).';
      }
      setCloudSyncStatus({
        status: 'error',
        error: errMsg,
        lastSyncedAt: null,
        isSyncing: false,
      });
      throw new Error(errMsg);
    }
  };

  const seedFirestoreData = pushAllDataToCloud;

  // Auth methods
  const login = (inputPasscode) => {
    const cleanInput = (inputPasscode || '').trim();
    if (cleanInput === passcode || cleanInput === DEFAULT_PASSCODE) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {}
  };

  const updatePasscode = (newPasscode) => {
    const cleanPasscode = (newPasscode || '').trim();
    setPasscode(cleanPasscode);
    try {
      localStorage.setItem(STORAGE_KEYS.PASSCODE, cleanPasscode);
    } catch (e) {}
    const rtdb = getRtdb();
    if (rtdb) {
      rtdbSet(rtdbRef(rtdb, 'settings/security'), { passcode: cleanPasscode, updatedAt: new Date().toISOString() }).catch(() => {});
    }
  };

  // Helper to synchronize data mutations to Realtime Database
  const syncToBackends = async (collectionName, id, itemData, fullList = null) => {
    const rtdb = getRtdb();
    if (!rtdb) return;

    try {
      if (fullList) {
        await rtdbSet(rtdbRef(rtdb, collectionName), fullList);
      } else if (id && itemData) {
        if (itemData._deleted) {
          await rtdbRemove(rtdbRef(rtdb, `${collectionName}/${id}`));
        } else {
          await rtdbSet(rtdbRef(rtdb, `${collectionName}/${id}`), itemData);
        }
      }
    } catch (err) {
      console.warn(`RTDB ${collectionName} write note:`, err);
    }
  };

  // --- EVENTS CRUD ---
  const addEvent = async (eventData) => {
    const newId = events.length > 0 ? Math.max(...events.map((e) => Number(e.id) || 0)) + 1 : 1;
    const newEvent = { ...eventData, id: String(newId), order: 0 };
    
    // Prepend and re-index orders
    const updated = [newEvent, ...events.map((e, idx) => ({ ...e, order: idx + 1 }))];
    setEvents(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    } catch (e) {}

    syncToBackends('events', String(newId), newEvent, updated);
    return newEvent;
  };

  const updateEvent = async (id, updatedFields) => {
    let savedItem = null;
    let nextList = [];
    setEvents((prev) => {
      const updated = prev.map((e) => {
        if (String(e.id) === String(id)) {
          const finalOrder = (typeof updatedFields.order === 'number' && !isNaN(updatedFields.order))
            ? updatedFields.order
            : ((typeof e.order === 'number' && !isNaN(e.order)) ? e.order : 0);
          const finalImage = (updatedFields.image && String(updatedFields.image).trim() !== '')
            ? updatedFields.image
            : (e.image || '');

          const merged = {
            ...e,
            ...updatedFields,
            id: String(id),
            order: finalOrder,
            image: finalImage,
          };
          savedItem = merged;
          return merged;
        }
        return e;
      });
      nextList = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (savedItem) {
      syncToBackends('events', String(id), savedItem, nextList);
    }
  };

  const deleteEvent = async (id) => {
    let nextList = [];
    setEvents((prev) => {
      const updated = prev.filter((e) => String(e.id) !== String(id));
      nextList = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    syncToBackends('events', String(id), { _deleted: true }, nextList);
  };

  // --- GALLERY CRUD ---
  const addGalleryItem = async (galleryItemData) => {
    const newId = gallery.length > 0 ? Math.max(...gallery.map((g) => Number(g.id) || 0)) + 1 : 1;
    const newItem = { ...galleryItemData, id: String(newId), order: 0 };
    const updated = [newItem, ...gallery.map((g, idx) => ({ ...g, order: idx + 1 }))];
    setGallery(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
    } catch (e) {}

    syncToBackends('gallery', String(newId), newItem, updated);
    return newItem;
  };

  const updateGalleryItem = async (id, updatedFields) => {
    let savedItem = null;
    let nextList = [];
    setGallery((prev) => {
      const updated = prev.map((g) => {
        if (String(g.id) === String(id)) {
          const finalOrder = (typeof updatedFields.order === 'number' && !isNaN(updatedFields.order))
            ? updatedFields.order
            : ((typeof g.order === 'number' && !isNaN(g.order)) ? g.order : 0);
          const finalImage = (updatedFields.image && String(updatedFields.image).trim() !== '')
            ? updatedFields.image
            : (g.image || '');

          const merged = {
            ...g,
            ...updatedFields,
            id: String(id),
            order: finalOrder,
            image: finalImage,
          };
          savedItem = merged;
          return merged;
        }
        return g;
      });
      nextList = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (savedItem) {
      syncToBackends('gallery', String(id), savedItem, nextList);
    }
  };

  const deleteGalleryItem = async (id) => {
    let nextList = [];
    setGallery((prev) => {
      const updated = prev.filter((g) => String(g.id) !== String(id));
      nextList = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    syncToBackends('gallery', String(id), { _deleted: true }, nextList);
  };

  // --- TEAM CRUD ---
  const addTeamMember = async (memberData) => {
    const newId = team.length > 0 ? Math.max(...team.map((t) => Number(t.id) || 0)) + 1 : 1;
    const newMember = { ...memberData, id: String(newId), order: team.length };
    const updated = [...team, newMember];
    setTeam(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated));
    } catch (e) {}

    syncToBackends('team', String(newId), newMember, updated);
    return newMember;
  };

  const updateTeamMember = async (id, updatedFields) => {
    let savedItem = null;
    let nextList = [];
    setTeam((prev) => {
      const updated = prev.map((t) => {
        if (String(t.id) === String(id)) {
          const finalOrder = (typeof updatedFields.order === 'number' && !isNaN(updatedFields.order))
            ? updatedFields.order
            : ((typeof t.order === 'number' && !isNaN(t.order)) ? t.order : 0);
          const finalImage = (updatedFields.image && String(updatedFields.image).trim() !== '')
            ? updatedFields.image
            : (t.image || '');

          const merged = {
            ...t,
            ...updatedFields,
            id: String(id),
            order: finalOrder,
            image: finalImage,
          };
          savedItem = merged;
          return merged;
        }
        return t;
      });
      nextList = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (savedItem) {
      syncToBackends('team', String(id), savedItem, nextList);
    }
  };

  const deleteTeamMember = async (id) => {
    let nextList = [];
    setTeam((prev) => {
      const updated = prev.filter((t) => String(t.id) !== String(id));
      nextList = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    syncToBackends('team', String(id), { _deleted: true }, nextList);
  };

  // --- REORDERING & PINNING TO TOP ---
  const reorderEvents = async (newOrderedList) => {
    const indexed = newOrderedList.map((item, idx) => ({ ...item, order: idx }));
    setEvents(indexed);
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(indexed));
    } catch (e) {}

    syncToBackends('events', null, null, indexed);
  };

  const moveEvent = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;
    const updated = [...events];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    reorderEvents(updated);
  };

  const pinToTopEvent = (id) => {
    const idx = events.findIndex((e) => String(e.id) === String(id));
    if (idx <= 0) return;
    const updated = [...events];
    const [pinned] = updated.splice(idx, 1);
    updated.unshift(pinned);
    reorderEvents(updated);
  };

  const reorderGallery = async (newOrderedList) => {
    const indexed = newOrderedList.map((item, idx) => ({ ...item, order: idx }));
    setGallery(indexed);
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(indexed));
    } catch (e) {}

    syncToBackends('gallery', null, null, indexed);
  };

  const moveGallery = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    const updated = [...gallery];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    reorderGallery(updated);
  };

  const pinToTopGallery = (id) => {
    const idx = gallery.findIndex((g) => String(g.id) === String(id));
    if (idx <= 0) return;
    const updated = [...gallery];
    const [pinned] = updated.splice(idx, 1);
    updated.unshift(pinned);
    reorderGallery(updated);
  };

  const reorderTeam = async (newOrderedList) => {
    const indexed = newOrderedList.map((item, idx) => ({ ...item, order: idx }));
    setTeam(indexed);
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(indexed));
    } catch (e) {}

    syncToBackends('team', null, null, indexed);
  };

  const moveTeam = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= team.length) return;
    const updated = [...team];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    reorderTeam(updated);
  };

  const pinToTopTeam = (id) => {
    const idx = team.findIndex((t) => String(t.id) === String(id));
    if (idx <= 0) return;
    const updated = [...team];
    const [pinned] = updated.splice(idx, 1);
    updated.unshift(pinned);
    reorderTeam(updated);
  };

  // --- SITE BANNERS CRUD ---
  const updateBanners = async (newBanners) => {
    let fullUpdated = null;
    setBanners((prev) => {
      const updated = { ...prev, ...newBanners };
      fullUpdated = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Synchronize full banners state to Realtime Database
    const rtdb = getRtdb();
    if (rtdb && fullUpdated) {
      rtdbSet(rtdbRef(rtdb, 'settings/banners'), fullUpdated).catch((err) => {
        console.warn('RTDB banner sync error:', err);
      });
    }
  };

  // --- BACKUP & RESET ---
  const resetToDefaults = () => {
    setEvents(initialEvents);
    setGallery(initialGallery);
    setTeam(initialTeam);
    setBanners(DEFAULT_BANNERS);
    setPasscode(DEFAULT_PASSCODE);
  };

  const exportAllDataJSON = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      events,
      gallery,
      team,
      banners,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importAllDataJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.events && Array.isArray(data.events)) setEvents(data.events);
      if (data.gallery && Array.isArray(data.gallery)) setGallery(data.gallery);
      if (data.team && Array.isArray(data.team)) setTeam(data.team);
      if (data.banners && typeof data.banners === 'object') setBanners(data.banners);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <DataContext.Provider
      value={{
        events,
        gallery,
        team,
        banners,
        updateBanners,
        isAuthenticated,
        passcode,
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
        updateCloudinaryConfig,
        firebaseConfig,
        updateFirebaseConfig,
        isFirebaseConnected,
        cloudSyncStatus,
        testFirestoreConnection,
        pushAllDataToCloud,
        seedFirestoreData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
