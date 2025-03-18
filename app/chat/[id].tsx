// /app/chat/[id].tsx
import MicButton from '@/components/ui/MicButton'
import { useFirestore } from '@/context/FirestoreContext'
import { useChatConversation } from '@/hooks/useChatConversation'
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
	const { messages, isLoading, error, sendMessage } = useChatConversation();

	const {
		isListening,
		transcript,
		startListening,
		stopListening,
		isRecognized,
	} = useSpeechToText()

	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
	const [inputText, setInputText] = useState('')
	const flatListRef = useRef<FlatList>(null)
	const autoSendTimer = useRef<NodeJS.Timeout | null>(null)

	// Fetch messages and sort them by timestamp (oldest first)
	const fetchMessages = async () => {
		try {
			const messages = await getCollection(`chats/${chatId}/messages`)
			const sortedMessages = messages.sort(
				(a: ChatMessage, b: ChatMessage) =>
					new Date(a.timestamp).getTime() -
					new Date(b.timestamp).getTime()
			)
			setChatMessages(sortedMessages)
		} catch (error) {
			console.error('Error fetching messages:', error)
		}
	}

	useEffect(() => {
		if (chatId) {
			fetchMessages()
		}
	}, [chatId])

	// // Update input text when transcript changes
	// useEffect(() => {
	// 	if (transcript) {
	// 		setInputText(transcript)
	// 	}
	// }, [transcript])

	// // Auto-send 2 seconds after speech stops
	// useEffect(() => {
	// 	if (!isListening && inputText.trim() !== '') {
	// 		// Set a 2-second timer to auto-send the message
	// 		autoSendTimer.current = setTimeout(() => {
	// 			handleSendMessage()
	// 		}, 2000)
	// 	} else {
	// 		if (autoSendTimer.current) {
	// 			clearTimeout(autoSendTimer.current)
	// 		}
	// 	}
	// }, [isListening, inputText])

	const handleSendMessage = async () => {
		if (!inputText.trim()) return

		const userMsg: ChatMessage = {
			text: inputText.trim(),
			role: 'user',
			timestamp: new Date().toISOString(),
		}

		try {
			// Add user's message to Firestore
			await addDocument(`chats/${chatId}/messages`, userMsg)
			setChatMessages(prev => [...prev, userMsg])
			setInputText('')
			flatListRef.current?.scrollToEnd({ animated: true })

			// Generate AI response based on the user's message
			const aiResponse = await sendMessage(userMsg.text)
			const aiMsg: ChatMessage = {
				text: aiResponse || 'Error generating response',
				role: 'AI',
				timestamp: new Date().toISOString(),
			}

			// Add AI message to Firestore
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
			{/* Chat input area with voice input */}
			<View className='flex-row items-center mt-4'>
				<MicButton
					isListening={isListening}
					onPress={isListening ? stopListening : startListening}
				/>
				<TextInput
					className='flex-1 h-16 border border-gray-300 rounded-lg bg-white px-4 text-lg'
					placeholder='Type or speak your message...'
					placeholderTextColor='#A0AEC0'
					value={inputText}
					onChangeText={setInputText}
					onSubmitEditing={handleSendMessage}
					returnKeyType='send'
				/>
			</View>
			<TouchableOpacity
				className='w-full bg-blue-500 p-4 rounded-lg mt-2'
				onPress={handleSendMessage}
				disabled={isLoading}
			>
				<Text className='text-white text-center font-bold text-lg'>
					{isLoading ? 'Sending...' : 'Send'}
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
