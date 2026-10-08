import React, { createContext, useContext, useState, useEffect } from 'react';
import { eventsData as initialEvents } from '../data/events';
import { galleryData as initialGallery } from '../data/gallery';
import { teamData as initialTeam } from '../data/team';
import { 
  initFirebase, 
  getDb, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc 
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
      return saved ? JSON.parse(saved) : DEFAULT_FIREBASE;
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
  // FIREBASE FIRESTORE REAL-TIME SYNC
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

    const db = initFirebase(firebaseConfig);
    if (!db) {
      setIsFirebaseConnected(false);
      setCloudSyncStatus({
        status: 'uninitialized',
        error: 'Failed to initialize Firebase App.',
        lastSyncedAt: null,
        isSyncing: false,
      });
      return;
    }

    setIsFirebaseConnected(true);

    const handleListenerError = (collName, err) => {
      console.warn(`Firestore ${collName} listener warning:`, err);
      let errMsg = err?.message || String(err);
      if (errMsg.includes('Cloud Firestore API has not been used') || errMsg.includes('PERMISSION_DENIED')) {
        errMsg = 'Cloud Firestore Database is not enabled or permissions are denied in Firebase Console.';
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

    // 1. Real-time Events Listener (3-layer merge)
    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        markSuccessSync();
        const savedEvents = (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEYS.EVENTS);
            return s ? JSON.parse(s) : [];
          } catch {
            return [];
          }
        })();

        if (!snapshot.empty) {
          const cloudEvents = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          const merged = mergeWithDefaults(initialEvents, cloudEvents, savedEvents);
          setEvents(merged);
        } else {
          const merged = mergeWithDefaults(initialEvents, [], savedEvents);
          setEvents(merged);
        }
      },
      (error) => handleListenerError('Events', error)
    );

    // 2. Real-time Gallery Listener (3-layer merge)
    const unsubGallery = onSnapshot(
      collection(db, 'gallery'),
      (snapshot) => {
        markSuccessSync();
        const savedGallery = (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEYS.GALLERY);
            return s ? JSON.parse(s) : [];
          } catch {
            return [];
          }
        })();

        if (!snapshot.empty) {
          const cloudGallery = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          const merged = mergeWithDefaults(initialGallery, cloudGallery, savedGallery);
          setGallery(merged);
        } else {
          const merged = mergeWithDefaults(initialGallery, [], savedGallery);
          setGallery(merged);
        }
      },
      (error) => handleListenerError('Gallery', error)
    );

    // 3. Real-time Team Listener (3-layer merge)
    const unsubTeam = onSnapshot(
      collection(db, 'team'),
      (snapshot) => {
        markSuccessSync();
        const savedTeam = (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEYS.TEAM);
            return s ? JSON.parse(s) : [];
          } catch {
            return [];
          }
        })();

        if (!snapshot.empty) {
          const cloudTeam = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          const merged = mergeWithDefaults(initialTeam, cloudTeam, savedTeam);
          setTeam(merged);
        } else {
          const merged = mergeWithDefaults(initialTeam, [], savedTeam);
          setTeam(merged);
        }
      },
      (error) => handleListenerError('Team', error)
    );

    // 4. Real-time Banners Listener
    const unsubBanners = onSnapshot(
      doc(db, 'settings', 'banners'),
      (docSnap) => {
        markSuccessSync();
        if (docSnap.exists()) {
          setBanners((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (error) => handleListenerError('Banners', error)
    );

    return () => {
      unsubEvents();
      unsubGallery();
      unsubTeam();
      unsubBanners();
    };
  }, [firebaseConfig]);

  const updateCloudinaryConfig = (newConfig) => {
    setCloudinaryConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateFirebaseConfig = (newConfig) => {
    setFirebaseConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Test Firestore Connection
  const testFirestoreConnection = async () => {
    const db = getDb();
    if (!db) {
      return { success: false, error: 'Firebase is not initialized. Please verify configuration.' };
    }
    try {
      const pingDoc = doc(db, '_healthcheck', 'ping');
      await setDoc(pingDoc, { ping: true, timestamp: new Date().toISOString() });
      setCloudSyncStatus({
        status: 'synced',
        error: null,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      });
      return { success: true };
    } catch (err) {
      let errMsg = err?.message || String(err);
      if (errMsg.includes('Cloud Firestore API has not been used') || errMsg.includes('PERMISSION_DENIED')) {
        errMsg = 'Cloud Firestore is not enabled or permission was denied. Please create/enable Firestore Database in Firebase Console and set rules to allow read/write.';
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

  // Push / Seed All Local Data to Firestore Cloud so every device worldwide sees it
  const pushAllDataToCloud = async () => {
    const db = getDb();
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    setCloudSyncStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      // 1. Seed Events
      for (const ev of events) {
        const docId = String(ev.id);
        await setDoc(doc(db, 'events', docId), { ...ev, id: docId }, { merge: true });
      }

      // 2. Seed Gallery
      for (const gal of gallery) {
        const docId = String(gal.id);
        await setDoc(doc(db, 'gallery', docId), { ...gal, id: docId }, { merge: true });
      }

      // 3. Seed Team
      for (const mem of team) {
        const docId = String(mem.id);
        await setDoc(doc(db, 'team', docId), { ...mem, id: docId }, { merge: true });
      }

      // 4. Seed Banners
      if (banners) {
        await setDoc(doc(db, 'settings', 'banners'), banners, { merge: true });
      }

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
      let errMsg = err?.message || String(err);
      if (errMsg.includes('Cloud Firestore API has not been used') || errMsg.includes('PERMISSION_DENIED')) {
        errMsg = 'Firestore Database is not enabled in Firebase Console (unstop-igniters) or permissions were denied. Please enable Firestore Database in test mode.';
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
    if (inputPasscode === passcode) {
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
    setPasscode(newPasscode);
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

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'events', String(newId)), newEvent);
      } catch (err) {
        console.error('Firestore addEvent error:', err);
      }
    }

    return newEvent;
  };

  const updateEvent = async (id, updatedFields) => {
    let savedItem = null;
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
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const db = getDb();
    if (db && savedItem) {
      try {
        await setDoc(doc(db, 'events', String(id)), savedItem, { merge: true });
      } catch (err) {
        console.error('Firestore updateEvent error:', err);
      }
    }
  };

  const deleteEvent = async (id) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => String(e.id) !== String(id));
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'events', String(id)), { _deleted: true }, { merge: true });
      } catch (err) {
        console.error('Firestore deleteEvent error:', err);
      }
    }
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

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'gallery', String(newId)), newItem);
      } catch (err) {
        console.error('Firestore addGalleryItem error:', err);
      }
    }

    return newItem;
  };

  const updateGalleryItem = async (id, updatedFields) => {
    let savedItem = null;
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
      try {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const db = getDb();
    if (db && savedItem) {
      try {
        await setDoc(doc(db, 'gallery', String(id)), savedItem, { merge: true });
      } catch (err) {
        console.error('Firestore updateGalleryItem error:', err);
      }
    }
  };

  const deleteGalleryItem = async (id) => {
    setGallery((prev) => {
      const updated = prev.filter((g) => String(g.id) !== String(id));
      try {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'gallery', String(id)), { _deleted: true }, { merge: true });
      } catch (err) {
        console.error('Firestore deleteGalleryItem error:', err);
      }
    }
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

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'team', String(newId)), newMember);
      } catch (err) {
        console.error('Firestore addTeamMember error:', err);
      }
    }

    return newMember;
  };

  const updateTeamMember = async (id, updatedFields) => {
    let savedItem = null;
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
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const db = getDb();
    if (db && savedItem) {
      try {
        await setDoc(doc(db, 'team', String(id)), savedItem, { merge: true });
      } catch (err) {
        console.error('Firestore updateTeamMember error:', err);
      }
    }
  };

  const deleteTeamMember = async (id) => {
    setTeam((prev) => {
      const updated = prev.filter((t) => String(t.id) !== String(id));
      try {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'team', String(id)), { _deleted: true }, { merge: true });
      } catch (err) {
        console.error('Firestore deleteTeamMember error:', err);
      }
    }
  };

  // --- REORDERING & PINNING TO TOP ---
  const reorderEvents = async (newOrderedList) => {
    const indexed = newOrderedList.map((item, idx) => ({ ...item, order: idx }));
    setEvents(indexed);
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(indexed));
    } catch (e) {}

    const db = getDb();
    if (db) {
      try {
        for (const item of indexed) {
          await setDoc(doc(db, 'events', String(item.id)), item, { merge: true });
        }
      } catch (err) {
        console.error('Firestore reorderEvents error:', err);
      }
    }
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

    const db = getDb();
    if (db) {
      try {
        for (const item of indexed) {
          await setDoc(doc(db, 'gallery', String(item.id)), item, { merge: true });
        }
      } catch (err) {
        console.error('Firestore reorderGallery error:', err);
      }
    }
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

    const db = getDb();
    if (db) {
      try {
        for (const item of indexed) {
          await setDoc(doc(db, 'team', String(item.id)), item, { merge: true });
        }
      } catch (err) {
        console.error('Firestore reorderTeam error:', err);
      }
    }
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
    // 1. Immediately update in-memory state and localStorage
    setBanners((prev) => {
      const updated = { ...prev, ...newBanners };
      try {
        localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Synchronize to Firestore with race timeout so UI never hangs
    const db = getDb();
    if (db) {
      try {
        await Promise.race([
          setDoc(doc(db, 'settings', 'banners'), newBanners, { merge: true }),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ]);
      } catch (err) {
        console.warn('Firestore updateBanners warning:', err);
      }
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
