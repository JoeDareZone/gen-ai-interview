// NewChatButton.tsx
import { useFirestore } from '@/context/FirestoreContext'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { v4 as uuidv4 } from 'uuid'

export default function NewChatButton() {
	const { addDocument } = useFirestore()
	const router = useRouter()

	const handleNewChat = async () => {
		const chatId = uuidv4()

		await addDocument('chats', {
			chatId,
			createdAt: new Date().toISOString(),
		}).

		router.push(`/chats/${chatId}`)
	}

	return (
		<TouchableOpacity
			onPress={handleNewChat}
			className='bg-blue-500 p-4 rounded-lg m-4'
		>
			<Text className='text-white text-center text-lg font-bold'>
				Start New Chat
			</Text>
		</TouchableOpacity>
	)
}
