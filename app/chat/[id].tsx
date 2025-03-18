// /app/tabs/chat/[chatId].tsx
import { useChat } from '@/context/ChatContext'
import { useFirestore } from '@/context/FirestoreContext'
import { firestore } from '@/firebaseConfig'
import { useOpenAI } from '@/hooks/useOpenAI'
import { ChatMessage } from '@/types/chat'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatScreen() {
	const { id: chatId } = useLocalSearchParams()
	const router = useRouter()
	const { addDocument, getSubcollection } = useFirestore()
	const [newMessage, setNewMessage] = useState('')
	const flatListRef = useRef<FlatList>(null)
	const { isLoading, error, fetchMessages } = useChat(chatId as string)
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const {
		generateCompletion,
		isLoading: isGenerating,
		completion,
	} = useOpenAI()

	const getMessages = async () => {
		const messages = await getSubcollection(`chats/${chatId}`, 'messages')
		setMessages(messages)
		console.log('Messages fetched:', messages)
		return messages
	}

	// Inside your ChatScreen component:

	useEffect(() => {
		if (chatId) {
			// Listen to changes in the messages subcollection for this chat
			const messagesRef = collection(
				firestore,
				`chats/${chatId}/messages`
			)
			const unsubscribe = onSnapshot(messagesRef, snapshot => {
				const msgs = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))
				console.log('Real-time messages:', msgs)
				setMessages(msgs as unknown as ChatMessage[])
				// Optionally, scroll to bottom after update
				setTimeout(
					() => flatListRef.current?.scrollToEnd({ animated: true }),
					100
				)
			})

			// Cleanup the listener on unmount
			return () => unsubscribe()
		}
	}, [chatId])

	useEffect(() => {
		if (chatId) {
			getMessages()
		}
	}, [chatId])

	const handleSendMessage = async () => {
		if (!newMessage.trim()) return

		const userMessage = {
			text: newMessage.trim(),
			role: 'user',
			timestamp: new Date().toISOString(),
		}

		try {
			await addDocument(`chats/${chatId}/messages`, userMessage)

			const aiResponse = await generateCompletion(newMessage.trim())
				.then(response => {
					console.log('AI response:', response)
					return response
				})
				.catch(error => {
					console.error('Error generating AI response:', error)
					return null
				})

			if (!aiResponse) {
				console.error('No AI response received')
				return
			}

			const aiMessage = {
				text: aiResponse,
				role: 'AI',
				timestamp: new Date().toISOString(),
			}
			await addDocument(`chats/${chatId}/messages`, aiMessage)

			// Refresh messages
			await getMessages()

			// Clear input and scroll to bottom
			setNewMessage('')
			flatListRef.current?.scrollToEnd({ animated: true })
		} catch (error) {
			console.error('Error handling message:', error)
		}
	}

	const renderItem = ({ item }: { item: ChatMessage }) => (
		<View
			className={`p-3 rounded-lg my-2 mx-4 ${
				item.role === 'user'
					? 'bg-blue-200 self-end'
					: 'bg-white self-start'
			}`}
		>
			<Text className='text-base text-gray-800'>{item.text}</Text>
		</View>
	)

	return (
		<SafeAreaView className='flex-1 bg-blue-50 p-4'>
			<View className='flex-row justify-between items-center mb-4'>
				<TouchableOpacity onPress={() => router.back()} className='p-2'>
					<Text className='text-lg font-bold'>&larr; Back</Text>
				</TouchableOpacity>
				<Text className='text-xl font-bold'>Chat {chatId}</Text>
				<View className='p-2' />
			</View>
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item, index) => index.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 20 }}
				onContentSizeChange={() =>
					flatListRef.current?.scrollToEnd({ animated: true })
				}
			/>
			{isGenerating && (
				<View className='flex-row items-center justify-center py-2'>
					<ActivityIndicator size='small' color='#3b82f6' />
					<Text className='ml-2 text-gray-600'>
						AI is thinking...
					</Text>
				</View>
			)}
			<TextInput
				className='w-full h-16 border border-gray-300 rounded-lg bg-white px-4 text-lg'
				placeholder='Type your message...'
				placeholderTextColor='#A0AEC0'
				value={newMessage}
				onChangeText={setNewMessage}
				onSubmitEditing={handleSendMessage}
				returnKeyType='send'
			/>
			<TouchableOpacity
				className='w-full bg-blue-500 p-4 rounded-lg mt-2'
				onPress={handleSendMessage}
			>
				<Text className='text-white text-center font-bold text-lg'>
					Send
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
