
const DB_NAME = 'RaphaelStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'history';

// Initialize Database
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveToStudio = async (imageData) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const newItem = {
            id: Date.now(),
            url: imageData.url,
            prompt: imageData.prompt,
            model: imageData.model,
            timestamp: new Date().toISOString()
        };

        await new Promise((resolve, reject) => {
            const request = store.add(newItem);
            request.onsuccess = resolve;
            request.onerror = reject;
        });

        console.log("Saved to IndexedDB successfully");
        return newItem;
    } catch (error) {
        console.error("IndexedDB Save Error:", error);
        // Fallback to local storage for small metadata if needed, 
        // but IndexedDB is the primary solution for 5MB+ limits.
        return null;
    }
};

export const getStudioHistory = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                // Sort by timestamp descending
                const history = request.result.sort((a, b) => b.id - a.id);
                resolve(history);
            };
            request.onerror = reject;
        });
    } catch (error) {
        console.error("IndexedDB Fetch Error:", error);
        return [];
    }
};

export const deleteFromStudio = async (id) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    } catch (error) {
        console.error("IndexedDB Delete Error:", error);
    }
};

export const clearStudioHistory = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    } catch (error) {
        console.error("IndexedDB Clear Error:", error);
    }
};

/**
 * Helper to convert Blob URL to Base64 for persistence
 */
export const blobToBase64 = async (blobUrl) => {
    if (!blobUrl || blobUrl.startsWith('data:')) return blobUrl;
    try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Base64 conversion failed:", e);
        return blobUrl;
    }
};
