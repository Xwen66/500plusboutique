(function initInventoryService() {
  let firebaseEnabled = false;
  let db = null;
  let auth = null;
  let storage = null;

  function isPlaceholderConfig(config) {
    if (!config || !config.apiKey || !config.projectId) return true;
    return String(config.apiKey).includes('YOUR_') || String(config.projectId).includes('YOUR_');
  }

  function bootstrapFirebase() {
    const config = window.FIREBASE_CONFIG;

    if (!window.firebase || isPlaceholderConfig(config)) {
      firebaseEnabled = false;
      return;
    }

    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      db = window.firebase.firestore();
      auth = window.firebase.auth ? window.firebase.auth() : null;
      storage = window.firebase.storage ? window.firebase.storage() : null;
      firebaseEnabled = true;
    } catch (error) {
      firebaseEnabled = false;
      console.error('Firebase initialization failed:', error);
    }
  }

  function orderValue(vehicle) {
    return Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : Number.MAX_SAFE_INTEGER;
  }

  function sortByDisplayOrder(list) {
    return [...list].sort((a, b) => {
      const byOrder = orderValue(a) - orderValue(b);
      if (byOrder !== 0) return byOrder;
      return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    });
  }

  async function getVehiclesFromJson() {
    const response = await fetch('data/vehicles.json');
    const json = await response.json();
    return sortByDisplayOrder(json);
  }

  async function getVehicles() {
    if (!firebaseEnabled || !db) {
      return getVehiclesFromJson();
    }

    try {
      const snapshot = await db.collection('vehicles').get();
      const vehicles = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id
        };
      });
      return sortByDisplayOrder(vehicles);
    } catch (error) {
      console.error('Firestore read failed; falling back to local JSON:', error);
      return getVehiclesFromJson();
    }
  }

  function requireAuthForWrite() {
    if (!firebaseEnabled || !db || !auth) {
      throw new Error('Firebase is not configured. Check js/firebase-config.js and loaded SDKs.');
    }
    if (!auth.currentUser) {
      throw new Error('Not signed in. Sign in again in Admin before adding/removing vehicles.');
    }
  }

  function mapWriteError(error) {
    if (!error || !error.code) return error?.message || 'Write failed.';
    if (error.code === 'permission-denied') {
      return 'Missing or insufficient permissions. Sign in as admin and deploy firestore.rules + storage.rules to Firebase.';
    }
    if (error.code === 'unauthenticated') {
      return 'Unauthenticated request. Sign in again in Admin.';
    }
    return error.message || 'Write failed.';
  }

  async function uploadImages(files) {
    if (!firebaseEnabled || !storage || !auth || !auth.currentUser) {
      throw new Error('Storage upload requires signed-in admin and firebase-storage SDK.');
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const uploads = Array.from(files).map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported image type: ${file.type || file.name}`);
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, '-')}`;
      const ref = storage.ref(`vehicle-images/${fileName}`);
      await ref.put(file, { contentType: file.type });
      return ref.getDownloadURL();
    });

    return Promise.all(uploads);
  }

  async function addVehicle(vehicle) {
    try {
      requireAuthForWrite();
      const docRef = db.collection('vehicles').doc();
      const payload = {
        ...vehicle,
        id: docRef.id,
        dateAdded: vehicle.dateAdded || new Date().toISOString().slice(0, 10)
      };
      await docRef.set(payload);
      return payload;
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

  async function updateVehicle(id, patch) {
    try {
      requireAuthForWrite();
      await db.collection('vehicles').doc(id).set({ ...patch, id }, { merge: true });
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

  async function removeVehicle(id) {
    try {
      requireAuthForWrite();
      await db.collection('vehicles').doc(id).delete();
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

  async function addInquiry(inquiry) {
    if (!firebaseEnabled || !db) {
      throw new Error('Firebase is not configured.');
    }

    try {
      const docRef = db.collection('inquiries').doc();
      const payload = {
        id: docRef.id,
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
        comment: inquiry.comment,
        createdAt: new Date().toISOString()
      };
      await docRef.set(payload);
      return payload;
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

  async function removeInquiry(id) {
    try {
      requireAuthForWrite();
      if (!firebaseEnabled || !db) return; // mock
      await db.collection('inquiries').doc(id).delete();
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

  async function getInquiries() {
    try {
      requireAuthForWrite();
      const snapshot = await db.collection('inquiries').get();
      return snapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

  function onAuthStateChanged(callback) {
    if (!firebaseEnabled || !auth) {
      callback(null);
      return function noop() { };
    }
    return auth.onAuthStateChanged(callback);
  }

  async function signIn(email, password) {
    if (!firebaseEnabled || !auth) {
      throw new Error('Firebase Auth is not configured.');
    }
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signOut() {
    if (!firebaseEnabled || !auth) {
      throw new Error('Firebase Auth is not configured.');
    }
    return auth.signOut();
  }

  bootstrapFirebase();

  window.InventoryService = {
    getVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    addInquiry,
    getInquiries,
    removeInquiry,
    uploadImages,
    onAuthStateChanged,
    signIn,
    signOut,
    isFirebaseEnabled: function isFirebaseEnabled() {
      return firebaseEnabled;
    }
  };
})();
