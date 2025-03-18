// FirestoreContext.tsx
import { addDoc, collection, getDocs } from 'firebase/firestore'
import React, { createContext, ReactNode, useContext } from 'react'
import { firestore } from '../firebaseConfig'

interface FirestoreContextType {
	getCollection: (collectionName: string) => Promise<any>
	addDocument: (collectionName: string, docData: object) => Promise<void>
	// You can add more methods as needed (e.g., updateDocument, deleteDocument)
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(
	undefined
)

export const FirestoreProvider = ({ children }: { children: ReactNode }) => {
	// Example function to fetch a collection
	const getCollection = async (collectionName: string) => {
		const snapshot = await getDocs(collection(firestore, collectionName))
		const data = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}))
		return data
	}

	// Example function to add a document to a collection
	const addDocument = async (collectionName: string, docData: object) => {
		await addDoc(collection(firestore, collectionName), docData)
	}

	return (
		<FirestoreContext.Provider value={{ getCollection, addDocument }}>
			{children}
		</FirestoreContext.Provider>
	)
}

export const useFirestore = () => {
	const context = useContext(FirestoreContext)
	if (!context) {
		throw new Error('useFirestore must be used within a FirestoreProvider')
	}
	return context
}
