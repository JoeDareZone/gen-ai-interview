// ExampleComponent.tsx
import { useAuth } from '@/context/AuthContext'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function ExampleComponent() {
	const { user, signInWithGoogle, signOut } = useAuth()

	return (
		<View className='flex-1 justify-center items-center'>
			{user ? (
				<>
					<Text className='text-lg'>Welcome, {user.displayName}</Text>
					<TouchableOpacity
						onPress={signOut}
						className='mt-4 bg-red-500 p-4 rounded-lg'
					>
						<Text className='text-white'>Sign Out</Text>
					</TouchableOpacity>
				</>
			) : (
				<TouchableOpacity
					onPress={signInWithGoogle}
					className='bg-blue-500 p-4 rounded-lg'
				>
					<Text className='text-white'>Sign In with Google</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}
