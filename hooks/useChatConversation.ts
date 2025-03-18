import OpenAI from 'openai'
import { useState } from 'react'

interface ChatMessage {
	role: 'system' | 'user' | 'assistant'
	content: string
}

interface UseChatConversationOptions {
	model?: string
	maxTokens?: number
	temperature?: number
}

interface UseChatConversationResult {
	messages: ChatMessage[]
	isLoading: boolean
	error: Error | null
	sendMessage: (prompt: string) => Promise<string>
}

export function useChatConversation(
	options: UseChatConversationOptions = {}
): UseChatConversationResult {
	// Start with a system message to set context
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: 'system',
			content:
				'You are a helpful educational assistant. Please provide clear, bullet-pointed answers and include relevant images links when possible.',
		},
	])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const client = new OpenAI({
		apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
	})

	// sendMessage appends the user message, calls OpenAI, and appends the assistant's reply.
	const sendMessage = async (prompt: string): Promise<string> => {
		console.log('prompt', prompt)
		if (!prompt.trim()) return ''
		setIsLoading(true)
		setError(null)

		// Append user's message to the conversation history
		const newUserMessage: ChatMessage = {
			role: 'user',
			content: prompt.trim(),
		}
		const updatedHistory = [...messages, newUserMessage]

		try {
			const response = await client.chat.completions.create({
				model: options.model || 'gpt-4',
				messages: updatedHistory,
				max_tokens: options.maxTokens || 1000,
				temperature: options.temperature || 0.7,
			})

			// Extract and trim the AI's reply
			const aiReply = response.choices[0].message.content?.trim() || ''
			const newAssistantMessage: ChatMessage = {
				role: 'assistant',
				content: aiReply,
			}

			// Update conversation history with both messages
			setMessages([...updatedHistory, newAssistantMessage])

			return aiReply
		} catch (err: any) {
			const errorObj =
				err instanceof Error ? err : new Error('An error occurred')
			setError(errorObj)
			throw errorObj
		} finally {
			setIsLoading(false)
		}
	}

	return { messages, isLoading, error, sendMessage }
}
