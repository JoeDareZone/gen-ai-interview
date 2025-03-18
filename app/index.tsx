import { useFirestore } from '@/context/FirestoreContext'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import uuid from 'react-native-uuid'

interface Chat {
	id: string
	chatId: string
	createdAt: string
	title?: string
}

export default function HomeScreen() {
	const router = useRouter()
	const { getCollection, addDocument } = useFirestore()
	const [chats, setChats] = useState<Chat[]>([])
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		const fetchChats = async () => {
			setLoading(true)
			try {
				const data = await getCollection('chats')
				const sortedChats = [...data].sort(
					(a, b) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
				)
				setChats(sortedChats)
			} catch (error) {
				console.error('Error fetching chats:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchChats()
	}, [])

	const createNewChat = async () => {
		const chatId = uuid.v4().toString()
		try {
			await addDocument('chats', {
				chatId,
				createdAt: new Date().toISOString(),
			})
			router.push(`/chat/${chatId}`)
		} catch (error) {
			console.error('Error creating chat:', error)
		}
	}

	const renderItem = ({ item }: { item: Chat }) => (
		<TouchableOpacity
			className='bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-200 mx-2'
			onPress={() => router.push(`/chat/${item.chatId}`)}
		>
			<View className='flex-row items-center justify-between'>
				<View className='flex-1'>
					<Text className='text-xl font-semibold text-gray-800 mb-1'>
						{item.title || `Chat ${item.chatId.substring(0, 8)}`}
					</Text>
					<Text className='text-sm text-gray-500'>
						{new Date(item.createdAt).toLocaleString()}
					</Text>
				</View>
				<Ionicons name='chevron-forward' size={24} color='#CBD5E1' />
			</View>
		</TouchableOpacity>
	)

	return (
		<SafeAreaView className='flex-1 bg-white'>
			{/* Header */}
			<View className='px-4 pt-6 pb-4 bg-white border-b border-gray-200'>
				<Text className='text-3xl font-bold text-gray-800 text-center'>
					Chat List
				</Text>
			</View>
			{/* Chat List */}
			<View className='flex-1 px-4 pt-4 bg-gray-100'>
				{loading ? (
					<View className='flex-1 items-center justify-center'>
						<Text className='text-gray-500 text-lg'>
							Loading chats...
						</Text>
					</View>
				) : (
					<FlatList
						data={chats}
						keyExtractor={item => item.id}
						renderItem={renderItem}
						contentContainerStyle={{ paddingBottom: 16 }}
					/>
				)}
			</View>
			{/* New Chat Button */}
			<View className='p-4 bg-white border-t border-gray-200'>
				<TouchableOpacity
					className='bg-purple-600 p-4 rounded-2xl shadow-sm flex-row items-center justify-center space-x-2'
					onPress={createNewChat}
				>
					<Ionicons name='add-circle' size={24} color='white' />
					<Text className='text-white text-lg font-semibold'>
						New Chat
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}
