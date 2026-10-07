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

// Helper to merge cloud items over baseline default items without losing untouched defaults
const mergeWithDefaults = (defaults, cloudItems) => {
  const map = new Map();
  // 1. Seed with baseline initial defaults
  defaults.forEach((item) => {
    map.set(String(item.id), { ...item });
  });

  // 2. Overlay cloud records (respecting explicit _deleted markers)
  if (Array.isArray(cloudItems)) {
    cloudItems.forEach((cloudItem) => {
      const id = String(cloudItem.id);
      if (cloudItem._deleted) {
        map.delete(id);
      } else {
        const existing = map.get(id) || {};
        map.set(id, { ...existing, ...cloudItem });
      }
    });
  }

  return Array.from(map.values());
};

export const DataProvider = ({ children }) => {
  // Local state with initial fallbacks
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithDefaults(initialEvents, parsed);
        }
      }
      return initialEvents;
    } catch {
      return initialEvents;
    }
  });

  const [gallery, setGallery] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithDefaults(initialGallery, parsed);
        }
      }
      return initialGallery;
    } catch {
      return initialGallery;
    }
  });

  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithDefaults(initialTeam, parsed);
        }
      }
      return initialTeam;
    } catch {
      return initialTeam;
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
      return;
    }

    const db = initFirebase(firebaseConfig);
    if (!db) {
      setIsFirebaseConnected(false);
      return;
    }

    setIsFirebaseConnected(true);

    // Sorting helper prioritizing custom order, fallback to ID
    const sortByCustomOrder = (a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      if (typeof a.order === 'number') return -1;
      if (typeof b.order === 'number') return 1;
      return Number(b.id) - Number(a.id);
    };

    // 1. Real-time Events Listener
    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudEvents = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          const merged = mergeWithDefaults(initialEvents, cloudEvents);
          merged.sort(sortByCustomOrder);
          setEvents(merged);
        } else {
          setEvents(initialEvents);
        }
      },
      (error) => {
        console.warn('Firestore Events listener error:', error);
      }
    );

    // 2. Real-time Gallery Listener
    const unsubGallery = onSnapshot(
      collection(db, 'gallery'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudGallery = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          const merged = mergeWithDefaults(initialGallery, cloudGallery);
          merged.sort(sortByCustomOrder);
          setGallery(merged);
        } else {
          setGallery(initialGallery);
        }
      },
      (error) => {
        console.warn('Firestore Gallery listener error:', error);
      }
    );

    // 3. Real-time Team Listener
    const unsubTeam = onSnapshot(
      collection(db, 'team'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudTeam = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          const merged = mergeWithDefaults(initialTeam, cloudTeam);
          merged.sort(sortByCustomOrder);
          setTeam(merged);
        } else {
          setTeam(initialTeam);
        }
      },
      (error) => {
        console.warn('Firestore Team listener error:', error);
      }
    );

    // 4. Real-time Banners Listener
    const unsubBanners = onSnapshot(
      doc(db, 'settings', 'banners'),
      (docSnap) => {
        if (docSnap.exists()) {
          setBanners((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (error) => {
        console.warn('Firestore Banners listener error:', error);
      }
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

  // Seed Firestore with initial site content
  const seedFirestoreData = async () => {
    const db = getDb();
    if (!db) {
      throw new Error('Firebase Firestore is not initialized.');
    }

    // Seed Events
    for (const ev of events) {
      const docId = String(ev.id);
      await setDoc(doc(db, 'events', docId), ev, { merge: true });
    }

    // Seed Gallery
    for (const gal of gallery) {
      const docId = String(gal.id);
      await setDoc(doc(db, 'gallery', docId), gal, { merge: true });
    }

    // Seed Team
    for (const mem of team) {
      const docId = String(mem.id);
      await setDoc(doc(db, 'team', docId), mem, { merge: true });
    }

    return true;
  };

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
    const newEvent = { ...eventData, id: String(newId) };
    
    // Update local state
    setEvents((prev) => [newEvent, ...prev]);

    // Push to Firestore if connected
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
    setEvents((prev) =>
      prev.map((e) => (String(e.id) === String(id) ? { ...e, ...updatedFields } : e))
    );

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'events', String(id)), updatedFields, { merge: true });
      } catch (err) {
        console.error('Firestore updateEvent error:', err);
      }
    }
  };

  const deleteEvent = async (id) => {
    setEvents((prev) => prev.filter((e) => String(e.id) !== String(id)));

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
    const newItem = { ...galleryItemData, id: String(newId) };
    setGallery((prev) => [newItem, ...prev]);

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
    setGallery((prev) =>
      prev.map((g) => (String(g.id) === String(id) ? { ...g, ...updatedFields } : g))
    );

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'gallery', String(id)), updatedFields, { merge: true });
      } catch (err) {
        console.error('Firestore updateGalleryItem error:', err);
      }
    }
  };

  const deleteGalleryItem = async (id) => {
    setGallery((prev) => prev.filter((g) => String(g.id) !== String(id)));

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
    const newMember = { ...memberData, id: String(newId) };
    setTeam((prev) => [...prev, newMember]);

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
    setTeam((prev) =>
      prev.map((t) => (String(t.id) === String(id) ? { ...t, ...updatedFields } : t))
    );

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'team', String(id)), updatedFields, { merge: true });
      } catch (err) {
        console.error('Firestore updateTeamMember error:', err);
      }
    }
  };

  const deleteTeamMember = async (id) => {
    setTeam((prev) => prev.filter((t) => String(t.id) !== String(id)));

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
    const db = getDb();
    if (db) {
      try {
        for (const item of indexed) {
          await setDoc(doc(db, 'events', String(item.id)), { order: item.order }, { merge: true });
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
    const db = getDb();
    if (db) {
      try {
        for (const item of indexed) {
          await setDoc(doc(db, 'gallery', String(item.id)), { order: item.order }, { merge: true });
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
    const db = getDb();
    if (db) {
      try {
        for (const item of indexed) {
          await setDoc(doc(db, 'team', String(item.id)), { order: item.order }, { merge: true });
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
