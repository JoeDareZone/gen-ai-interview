// /app/chat/[id].tsx
import AIResponse, { BulletPoint } from '@/components/ui/AIResponse'
import MicButton from '@/components/ui/MicButton'
import { useFirestore } from '@/context/FirestoreContext'
import { useChatConversation } from '@/hooks/useChatConversation'
import { useFetchImage } from '@/hooks/useFetchImage'
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
	const { fetchImage } = useFetchImage()

	const { isListening, transcript, startListening, stopListening } =
		useSpeechToText()

	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
	const [inputText, setInputText] = useState('')
	const flatListRef = useRef<FlatList>(null)

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

	const handleSendMessage = async (
		prompt?: string,
		type?: 'bulletPoints' | 'explainFurther'
	) => {
		if (!prompt) return

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

			if (type === 'bulletPoints' && !inputText.includes('further')) {
				console.log(inputText)
				console.log(
					'does it include further?',
					inputText.includes('further')
				)
				const fetchedImageUrl = await fetchImage(userMsg.text)

				aiMsg = {
					text: aiResponse.text,
					bulletPoints: aiResponse.bulletPoints || [],
					role: 'AI',
					imageUrl: fetchedImageUrl || '',
					timestamp: new Date().toISOString(),
				}
			} else {
				aiMsg = {
					text: aiResponse.text,
					role: 'AI',
					timestamp: new Date().toISOString(),
				}
			}

			await addDocument(`chats/${chatId}/messages`, aiMsg)
			setChatMessages(prev => [...prev, aiMsg])
			flatListRef.current?.scrollToEnd({ animated: true })
		} catch (error) {
			console.error('Error handling message:', error)
		}
	}

	const handleExplainBullet = (bullet: BulletPoint) => {
		handleSendMessage(
			`Explain more about: ${bullet.explanation}`,
			'explainFurther'
		)
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
			<View
				className={`p-3 rounded-lg my-2 mx-4 ${
					item.role === 'user'
						? 'bg-blue-200 self-end'
						: 'bg-white self-start'
				}`}
			>
				<Text className='text-base text-gray-800'>{item.text}</Text>
				{item.bulletPoints && (
					<View className='mt-2'>
						{item.bulletPoints.map((bp, idx) => (
							<Text key={idx} className='text-sm text-gray-600'>
								• {bp.explanation}: {bp.output}
							</Text>
						))}
					</View>
				)}
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
					onSubmitEditing={() =>
						handleSendMessage(inputText, 'bulletPoints')
					}
					returnKeyType='send'
				/>
			</View>
			<TouchableOpacity
				className='w-full bg-blue-500 p-4 rounded-lg mt-2'
				onPress={() => handleSendMessage(inputText, 'bulletPoints')}
				disabled={isLoading}
			>
				<Text className='text-white text-center font-bold text-lg'>
					{isLoading ? 'Sending...' : 'Send'}
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
