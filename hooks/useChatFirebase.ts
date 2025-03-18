import { useFirestore } from '@/context/FirestoreContext'
import { useOpenAI } from '@/hooks/useOpenAI'
import { ChatMessage } from '@/types/chat'

import { useState } from 'react'

const useChatFirebase = (chatId: string) => {
	const { addDocument, getCollection } = useFirestore()
	const { generateCompletion, isLoading, error } = useOpenAI()
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

	// Fetch existing messages for this chat from Firestore (optional)
	const fetchMessages = async () => {
		try {
			const messages = await getCollection(`chats/${chatId}/messages`)
			setChatMessages(messages)
		} catch (err) {
			console.error('Error fetching messages:', err)
		}
	}

	// Adds a new message to Firestore and updates local state
	const addMessage = async (message: ChatMessage) => {
		try {
			// Store message in Firestore under the subcollection "messages" of a chat document.
			await addDocument(`chats/${chatId}/messages`, {
				...message,
				timestamp: new Date().toISOString(),
			})
			setChatMessages(prev => [...prev, message])
		} catch (err) {
			console.error('Error adding message:', err)
		}
	}

	// Sends a user message and then calls OpenAI to get an AI response.
	const sendMessage = async (prompt: string) => {
		if (!prompt.trim()) return

		const userMsg: ChatMessage = {
			text: prompt,
			role: 'user',
		}

		// Add user's message
		await addMessage(userMsg)

		try {
			// Generate AI response based on the prompt
			const aiResponse = await generateCompletion(prompt)
			const aiMsg: ChatMessage = {
				text: aiResponse ?? 'Error generating response',
				role: 'AI',
			}
			await addMessage(aiMsg)
		} catch (err) {
			console.error('Error sending message:', err)
		}
	}

	return {
		chatMessages,
		isLoading,
		error,
		fetchMessages,
		sendMessage,
	}
}

export default useChatFirebase
