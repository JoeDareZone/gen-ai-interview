import AIResponse from '@/components/ui/AIResponse'
import { BulletPoint } from '@/components/ui/CollapsibleBullet'
import MicButton from '@/components/ui/MicButton'
import { useFirestore } from '@/context/FirestoreContext'
import { useChatConversation } from '@/hooks/useChatConversation'
import { useFetchImage } from '@/hooks/useFetchImage'
import { useSpeechToText } from '@/hooks/useSpeechToText'
import { ChatMessage } from '@/types/chat'
import { useLocalSearchParams, useRouter } from 'expo-router'
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
	const { id: chatId, grade, aiPersonality } = useLocalSearchParams()
	const router = useRouter()
	const { getCollection, addDocument } = useFirestore()
	const { sendMessage, isLoading } = useChatConversation({
		studentProfile: {
			grade: grade as string,
			aiPersonality: aiPersonality as string,
		},
	})
	const { fetchImage } = useFetchImage()
	const { isListening, transcript, startListening, stopListening } =
		useSpeechToText()

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

	useEffect(() => {
		if (!isListening && inputText.trim() !== '') {
			autoSendTimer.current = setTimeout(() => {
				handleSendMessage(inputText, 'bulletPoints')
			}, 2000)
		} else if (isListening && autoSendTimer.current) {
			clearTimeout(autoSendTimer.current)
		}
		return () => {
			if (autoSendTimer.current) clearTimeout(autoSendTimer.current)
		}
	}, [isListening, inputText])

	const handleSendMessage = async (
		prompt?: string,
		type?: 'bulletPoints' | 'explainFurther'
	) => {
		if (!prompt) return

		const fetchedImageUrl = await fetchImage(prompt)

		if (type === 'explainFurther') {
			prompt = `Can you elaborate further on the following point: "${prompt}"?`
		}

		const userMsg: ChatMessage = {
			text: prompt,
			role: 'user',
			timestamp: new Date().toISOString(),
		}

		try {
			await addDocument(`chats/${chatId}/messages`, userMsg)
			setChatMessages(prev => [...prev, userMsg])
			setInputText('')
			flatListRef.current?.scrollToEnd({ animated: true })

			const aiResponse = await sendMessage(userMsg.text, type)

			let aiMsg: ChatMessage
			aiMsg = {
				text: aiResponse.text,
				bulletPoints: aiResponse.bulletPoints || [],
				role: 'AI',
				imageUrl: fetchedImageUrl || '',
				timestamp: new Date().toISOString(),
			}

			await addDocument(`chats/${chatId}/messages`, aiMsg)
			setChatMessages(prev => [...prev, aiMsg])
			flatListRef.current?.scrollToEnd({ animated: true })
		} catch (error) {
			console.error('Error handling message:', error)
		}
	}

	const handleExplainBullet = (bullet: BulletPoint) => {
		handleSendMessage(`${bullet.explanation}`, 'explainFurther')
	}

	const renderItem = ({ item }: { item: ChatMessage }) => {
		if (item.role === 'AI') {
			return (
				<AIResponse
					response={item.text}
					bulletPoints={item.bulletPoints || []}
					imageUrl={item.imageUrl}
					onExplainBullet={handleExplainBullet}
				/>
			)
		}
		return (
			<View className='self-end bg-gray-200 p-3 rounded-lg my-2 max-w-[80%]'>
				<Text className='text-base text-gray-800'>{item.text}</Text>
			</View>
		)
	}

	return (
		<SafeAreaView className='flex-1 bg-white p-4'>
			{/* Header */}
			<View className='flex-row items-center mb-4 py-2 border-b border-gray-300'>
				<TouchableOpacity
					onPress={() => router.dismissAll()}
					className='p-2'
				>
					<Text className='text-lg font-bold text-gray-800'>
						&larr; Back
					</Text>
				</TouchableOpacity>
				<Text className='flex-1 text-center text-2xl font-bold text-gray-800'>
					Chat {chatId.toString().substring(0, 2)}
				</Text>
				<View className='w-12' />
			</View>
			{/* Chat messages */}
			<FlatList
				ref={flatListRef}
				data={chatMessages}
				keyExtractor={(_, index) => index.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 20 }}
				onContentSizeChange={() =>
					flatListRef.current?.scrollToEnd({ animated: true })
				}
				ListFooterComponent={
					<View>
						{isLoading && (
							<View className='h-10'>
								<ActivityIndicator size='small' color='#000' />
							</View>
						)}
					</View>
				}
				ListEmptyComponent={
					<View className='h-10 items-center justify-center'>
						<Text className='text-gray-500'>Ask me anything!</Text>
					</View>
				}
			/>
			{/* Input area */}
			<View className='flex-row items-center mt-4'>
				<MicButton
					isListening={isListening}
					onPress={isListening ? stopListening : startListening}
				/>
				<TextInput
					className='flex-1 h-12 border border-gray-300 rounded-lg bg-white px-3 text-lg ml-3'
					placeholder='Type or speak your message...'
					placeholderTextColor='#9E9E9E'
					value={inputText}
					onChangeText={setInputText}
					onSubmitEditing={() =>
						handleSendMessage(inputText, 'bulletPoints')
					}
					returnKeyType='send'
				/>
			</View>
			<TouchableOpacity
				className='w-full bg-purple-700 p-3 rounded-lg mt-3 items-center'
				onPress={() => handleSendMessage(inputText, 'bulletPoints')}
				disabled={isLoading}
			>
				<Text className='text-white font-bold text-base'>
					{isLoading ? 'Sending...' : 'Send'}
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
