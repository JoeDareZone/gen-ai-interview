import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { FirestoreProvider } from '@/context/FirestoreContext'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import 'react-native-reanimated'
import '../global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	})

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync()
		}
	}, [loaded])

	if (!loaded) {
		return null
	}

	return (
		<AuthProvider>
			<FirestoreProvider>
				<ChatProvider>
					<Stack>
						<Stack.Screen
							name='(tabs)'
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name='chat/[id]'
							options={{
								title: 'Chat',
							}}
						/>
					</Stack>
				</ChatProvider>
				<StatusBar style='auto' />
			</FirestoreProvider>
		</AuthProvider>
	)
}
