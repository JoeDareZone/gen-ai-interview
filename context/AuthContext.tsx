// AuthContext.tsx
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import {
	signOut as firebaseSignOut,
	getAuth,
	GoogleAuthProvider,
	signInWithCredential,
	User,
} from 'firebase/auth'
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import { app } from '../firebaseConfig'

WebBrowser.maybeCompleteAuthSession()

interface AuthContextType {
	user: User | null
	signInWithGoogle: () => Promise<void>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const auth = getAuth(app)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)

	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId:
			'17932247463-66teganbud48b7oqf9rsjjhit6n2vv5d.apps.googleusercontent.com',
		iosClientId:
			'17932247463-k6ju9uqdnkuef9c6l1chs8ijbg8l8gt1.apps.googleusercontent.com',
		androidClientId:
			'17932247463-b1r41dn9g92uc9eulbsoavj131j6gr8m.apps.googleusercontent.com',
	})

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(user => {
			setUser(user)
		})
		return unsubscribe
	}, [])

	useEffect(() => {
		if (response?.type === 'success') {
			const { idToken } = response.authentication!
			const credential = GoogleAuthProvider.credential(idToken)
			signInWithCredential(auth, credential).catch(error => {
				console.error('Google sign in error:', error)
			})
		}
	}, [response])

	const signInWithGoogle = async () => {
		try {
			await promptAsync()
		} catch (error) {
			console.error('Error during Google sign in:', error)
		}
	}

	const signOut = async () => {
		try {
			await firebaseSignOut(auth)
		} catch (error) {
			console.error('Error during sign out:', error)
		}
	}

	return (
		<AuthContext.Provider value={{ user, signInWithGoogle, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
