// FirestoreContext.tsx
import { addDoc, collection, getDocs } from 'firebase/firestore'
import React, { createContext, ReactNode, useContext } from 'react'
import { firestore } from '../firebaseConfig'

interface FirestoreContextType {
	getCollection: (collectionPath: string) => Promise<any>
	addDocument: (collectionPath: string, docData: object) => Promise<void>
	getSubcollection: (
		parentPath: string,
		subcollectionName: string
	) => Promise<any>
	addDocumentToSubcollection: (
		parentPath: string,
		subcollectionName: string,
		docData: object
	) => Promise<void>
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(
	undefined
)

export const FirestoreProvider = ({ children }: { children: ReactNode }) => {
	const getCollection = async (collectionPath: string) => {
		const snapshot = await getDocs(collection(firestore, collectionPath))
		const data = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}))
		console.log('Collection data:', data)
		return data
	}

	const addDocument = async (collectionPath: string, docData: object) => {
		console.log('Adding document to collection:', collectionPath)
		console.log('Document data:', docData)
		await addDoc(collection(firestore, collectionPath), docData)
			.then(() => console.log('Document added successfully'))
			.catch(error => console.error('Error adding document:', error))
	}

	const getSubcollection = async (
		parentPath: string,
		subcollectionName: string
	) => {
		const fullPath = `${parentPath}/${subcollectionName}`
		return getCollection(fullPath)
	}

	const addDocumentToSubcollection = async (
		parentPath: string,
		subcollectionName: string,
		docData: object
	) => {
		const fullPath = `${parentPath}/${subcollectionName}`
		await addDocument(fullPath, docData)
	}

	return (
		<FirestoreContext.Provider
			value={{
				getCollection,
				addDocument,
				getSubcollection,
				addDocumentToSubcollection,
			}}
		>
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
