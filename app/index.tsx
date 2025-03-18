// /app/tabs/index.tsx
import { useFirestore } from '@/context/FirestoreContext'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, Text, TouchableOpacity } from 'react-native'
import uuid from 'react-native-uuid'

interface Chat {
	id: string // Firestore document ID
	chatId: string // Unique chat identifier (e.g., UUID)
	createdAt: string
	title?: string
}

export default function HomeScreen() {
	const router = useRouter()
	const { getCollection } = useFirestore()
	const [chats, setChats] = useState<Chat[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const { addDocument } = useFirestore()

	useEffect(() => {
		const fetchChats = async () => {
			setLoading(true)
			try {
				const data = await getCollection('chats')
				setChats(data)
			} catch (error) {
				console.error('Error fetching chats:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchChats()
	}, [])

	const createNewChat = async () => {
		const chatId = uuid.v4()
		await addDocument('chats', {
			chatId,
			createdAt: new Date().toISOString(),
		})
			.then(() => {
				router.push(`/chat/${chatId}`)
			})
			.catch(error => {
				console.error('Error creating chat:', error)
			})
	}

	const renderItem = ({ item }: { item: Chat }) => (
		<TouchableOpacity
			className='bg-white p-4 rounded-xl shadow mb-3'
			onPress={() => router.push(`/chat/${item.chatId}`)}
		>
			<Text className='text-lg font-semibold'>
				{item.title || `Chat ${item.chatId}`}
			</Text>
			<Text className='text-sm text-gray-600'>
				Created at: {new Date(item.createdAt).toLocaleString()}
			</Text>
		</TouchableOpacity>
	)

	return (
		<SafeAreaView className='flex-1 bg-blue-50 p-4'>
			<Text className='text-3xl font-bold text-center text-gray-800 mb-6'>
				Available Chats
			</Text>
			{loading ? (
				<Text>Loading chats...</Text>
			) : (
				<FlatList
					data={chats}
					keyExtractor={item => item.id}
					renderItem={renderItem}
				/>
			)}
			<TouchableOpacity
				className='bg-blue-500 p-4 rounded-xl shadow mb-3'
				onPress={createNewChat}
			>
				<Text className='text-white text-center text-lg font-bold'>
					Start New Chat
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
