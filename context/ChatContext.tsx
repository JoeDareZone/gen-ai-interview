import { ChatMessage } from '@/types/chat'
import React, { createContext, useContext, useState } from 'react'
import { useFirestore } from './FirestoreContext'

interface ChatContextType {
	messages: ChatMessage[]
	isLoading: boolean
	error: Error | null
	fetchMessages: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const { getCollection } = useFirestore()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const fetchMessages = async () => {
		try {
			console.log('Fetching messages...')
			setIsLoading(true)
			setError(null)
			const chatMessages = await getCollection('messages').then(messages => {
				console.log('Messages fetched:', messages)
				setMessages(messages)
			}).catch(error => {
				console.error('Error fetching messages:', error)
			})
			console.log('Messages fetched:', chatMessages)
		} catch (err) {
			setError(
				err instanceof Error
					? err
					: new Error('Failed to fetch messages')
			)
		} finally {
			setIsLoading(false)
		}
	}

	const value = {
		messages,
		isLoading,
		error,
		fetchMessages,
	}

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(chatId: string) {
	const context = useContext(ChatContext)
	if (!context) {
		throw new Error('useChat must be used within a ChatProvider')
	}

	const { getCollection } = useFirestore()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const fetchMessages = async () => {
		try {
			setIsLoading(true)
			setError(null)
			const chatMessages = await getCollection(`chats/${chatId}/messages`)
			setMessages(chatMessages)
		} catch (err) {
			setError(
				err instanceof Error
					? err
					: new Error('Failed to fetch messages')
			)
		} finally {
			setIsLoading(false)
		}
	}

	return {
		messages,
		isLoading,
		error,
		fetchMessages,
	}
}
