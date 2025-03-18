import { useFirestore } from '@/context/FirestoreContext'
import { useOpenAI } from '@/hooks/useOpenAI'
import { useSpeechToText } from '@/hooks/useSpeechToText'
import { ChatMessage } from '@/types/chat'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChatScreen() {
	const { id: chatId } = useLocalSearchParams()
	const router = useRouter()
	const { getCollection, addDocument } = useFirestore()
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
	const [newMessage, setNewMessage] = useState('')
	const flatListRef = useRef<FlatList>(null)
	const { generateCompletion, isLoading } = useOpenAI()
	const { isListening, transcript, startListening, stopListening } =
		useSpeechToText()
	const [inputText, setInputText] = useState('')

	// Fetch messages from Firestore for this chat
	const fetchMessages = async () => {
		try {
			const messages = await getCollection(`chats/${chatId}/messages`)
			// Sort messages in ascending order based on the timestamp
			const sortedMessages = messages.sort(
				(
					a: { timestamp: string | number | Date },
					b: { timestamp: string | number | Date }
				) =>
					new Date(a.timestamp).getTime() -
					new Date(b.timestamp).getTime()
			)
			setChatMessages(sortedMessages)
			console.log('Messages fetched:', sortedMessages)
		} catch (error) {
			console.error('Error fetching messages:', error)
		}
	}

	useEffect(() => {
		if (chatId) {
			fetchMessages()
		}
	}, [chatId])

	useEffect(() => {
		if (transcript) {
			setInputText(transcript)
		}
	}, [transcript])

	const handleSendMessage = async () => {
		if (!newMessage.trim()) return

		// Create and add the user's message to Firestore
		const userMsg: ChatMessage = {
			text: newMessage.trim(),
			role: 'user',
			timestamp: new Date().toISOString(),
		}

		try {
			await addDocument(`chats/${chatId}/messages`, userMsg)
			setChatMessages(prev => [...prev, userMsg])
			setNewMessage('')
			flatListRef.current?.scrollToEnd({ animated: true })

			// Generate AI response based on the prompt
			const aiResponse = await generateCompletion(userMsg.text)
			const aiMsg: ChatMessage = {
				text: aiResponse || 'Error generating response',
				role: 'AI',
				timestamp: new Date().toISOString(),
			}

			// Add the AI message to Firestore
			await addDocument(`chats/${chatId}/messages`, aiMsg)
			setChatMessages(prev => [...prev, aiMsg])
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
				data={chatMessages}
				keyExtractor={(item, index) => index.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 20 }}
				onContentSizeChange={() =>
					flatListRef.current?.scrollToEnd({ animated: true })
				}
			/>
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
				disabled={isLoading}
			>
				<Text className='text-white text-center font-bold text-lg'>
					{isLoading ? 'Sending...' : 'Send'}
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={isListening ? stopListening : startListening}
				className='bg-gray-200 p-2 rounded-full mr-2'
			>
				<Text>{isListening ? 'Stop' : 'Speak'}</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
