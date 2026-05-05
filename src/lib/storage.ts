import { INDEXEDDB_CONFIG } from './constants'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      INDEXEDDB_CONFIG.DB_NAME,
      INDEXEDDB_CONFIG.DB_VERSION
    )

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORE_NAME)) {
        db.createObjectStore(INDEXEDDB_CONFIG.STORE_NAME, { keyPath: 'userId' })
      }
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

export async function savePrivateKey(
  userId: string,
  privateKey: CryptoKey
): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      INDEXEDDB_CONFIG.STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(INDEXEDDB_CONFIG.STORE_NAME)

    const request = store.put({ userId, privateKey })

    request.onsuccess = () => resolve()

    request.onerror = () => reject(request.error)
  })
}

export async function getPrivateKey(userId: string): Promise<CryptoKey | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      INDEXEDDB_CONFIG.STORE_NAME,
      'readonly'
    )

    const store = transaction.objectStore(INDEXEDDB_CONFIG.STORE_NAME)

    const request = store.get(userId)

    request.onsuccess = () => {
      if (!request.result) {
        resolve(null)
        return
      }
      resolve(request.result.privateKey as CryptoKey)
    }

    request.onerror = () => reject(request.error)
  })
}

export async function deletePrivateKey(userId: string): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      INDEXEDDB_CONFIG.STORE_NAME,
      'readwrite'
    )

    const store = transaction.objectStore(INDEXEDDB_CONFIG.STORE_NAME)

    const request = store.delete(userId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
