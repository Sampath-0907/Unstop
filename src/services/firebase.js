import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  onValue as rtdbOnValue,
  remove as rtdbRemove,
  update as rtdbUpdate
} from 'firebase/database';

let app = null;
let db = null;   // Cloud Firestore
let rtdb = null; // Realtime Database

export const initFirebase = (config) => {
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    try {
      const dbUrl = config.databaseURL || 'https://unstop-igniters-default-rtdb.asia-southeast1.firebasedatabase.app';
      rtdb = getDatabase(app, dbUrl);
    } catch (e) {
      console.warn('Realtime Database init note:', e);
    }

    return { db, rtdb, app };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
};

export const getDb = () => db;
export const getRtdb = () => rtdb;

export { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbOnValue,
  rtdbRemove,
  rtdbUpdate
};

