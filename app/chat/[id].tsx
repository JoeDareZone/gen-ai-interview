// /app/chat/[id].tsx
import AIResponse from '@/components/ui/AIResponse'
import MicButton from '@/components/ui/MicButton'
import { useFirestore } from '@/context/FirestoreContext'
import { useChatConversation } from '@/hooks/useChatConversation'
import { useWikimediaImage } from '@/hooks/useFetchImage'
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
	const { sendMessage, isLoading } = useChatConversation()
	const { fetchImage } = useWikimediaImage()

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

	const fetchMessages = async () => {
		try {
			const messages = await getCollection(`chats/${chatId}/messages`)
			const sortedMessages = messages.sort(
				(a: ChatMessage, b: ChatMessage) =>
					new Date(a.timestamp || '').getTime() -
					new Date(b.timestamp || '').getTime()
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

	useEffect(() => {
		if (transcript) {
			setInputText(transcript)
		}
	}, [transcript])

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

			// Generate AI response
			const aiResponse = await sendMessage(userMsg.text)

			const fetchedImageUrl = await fetchImage(userMsg.text)

			console.log(fetchedImageUrl)

			const aiMsg: ChatMessage = {
				text: aiResponse,
				role: 'AI',
				imageUrl: fetchedImageUrl || '',
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

	const renderItem = ({ item }: { item: ChatMessage }) => {
		if (item.role === 'AI') {
			return <AIResponse response={item.text} imageUrl={item.imageUrl} />
		}
		return (
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
	}

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
			<TouchableOpacity
				className='w-full bg-blue-500 p-4 rounded-lg mt-2'
				onPress={() => {
					fetchImage('algebra').then(url => {
						console.log(url)
					})
				}}
				disabled={isLoading}
			>
				<Text className='text-white text-center font-bold text-lg'>
					{isLoading ? 'Sending...' : 'Fetch Image'}
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
