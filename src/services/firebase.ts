import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import type { AppState } from '@/types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const docRef = doc(db, 'produtividade', 'estado')

export async function loadFromFirestore(): Promise<AppState | null> {
  try {
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data() as AppState
    }
  } catch (e) {
    console.error('Falha ao carregar do Firestore:', e)
  }
  return null
}

export async function saveToFirestore(state: AppState): Promise<boolean> {
  try {
    await setDoc(docRef, JSON.parse(JSON.stringify(state)))
    return true
  } catch (e) {
    console.error('Falha ao salvar no Firestore:', e)
    return false
  }
}
