import OpenAI from 'openai'
import { useState } from 'react'

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant'
	content: string
	imageUrl?: string
	timestamp?: string
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
	// Initialize with a system prompt that instructs the AI on formatting.
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: 'system',
			content:
				'You are a helpful educational assistant. Provide clear bullet-pointed answers. For example: "- Key point 1\n- Key point 2\n- ',
		},
	])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const client = new OpenAI({
		apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
	})

	// sendMessage appends the user message, sends the full conversation history to OpenAI,
	// then parses and appends the assistant's reply.
	const sendMessage = async (prompt: string): Promise<string> => {
		if (!prompt.trim()) return ''
		setIsLoading(true)
		setError(null)

		// Append user's message to the conversation history (without timestamp for conversation context)
		const newUserMessage: ChatMessage = {
			role: 'user',
			content: prompt.trim(),
			timestamp: new Date().toISOString(),
		}
		const updatedHistory = [...messages, newUserMessage]

		try {
			const response = await client.chat.completions.create({
				model: options.model || 'gpt-4',
				messages: updatedHistory,
				max_tokens: options.maxTokens || 1000,
				temperature: options.temperature || 0.7,
			})

			const aiReply = response.choices[0].message.content?.trim() || ''
			// Parse the assistant's reply for image links
			const newAssistantMessage: ChatMessage = {
				role: 'assistant',
				content: aiReply,
				timestamp: new Date().toISOString(),
			}

			console.log(newAssistantMessage)

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
