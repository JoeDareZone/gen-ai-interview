import {
	ChatMessage,
	UseChatConversationOptions,
	UseChatConversationResult,
} from '@/types/chat'
import OpenAI from 'openai'
import { useState } from 'react'

export function useChatConversation(
	options: UseChatConversationOptions = {}
): UseChatConversationResult {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: 'AI',
			text: 'You are a helpful educational assistant. Provide clear bullet-pointed answers. For example: "- Key point 1\n- Key point 2\n- ',
		},
	])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const client = new OpenAI({
		apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
	})

	const sendMessage = async (
		prompt: string,
		type?: 'bulletPoints' | 'explainFurther'
	): Promise<ChatMessage> => {
		if (!prompt.trim()) return { role: 'AI', text: '' }
		setIsLoading(true)
		setError(null)

		const newUserMessage: ChatMessage = {
			role: 'user',
			text: prompt.trim(),
			timestamp: new Date().toISOString(),
		}
		const updatedHistory = [...messages, newUserMessage]

		let newAssistantMessage: ChatMessage

		try {
			if (type === 'explainFurther') {
				const explainFurtherResponse =
					await client.chat.completions.create({
						model: 'gpt-4o-2024-08-06',
						messages: updatedHistory.map(message => ({
							role: message.role === 'AI' ? 'assistant' : 'user',
							content: message.text,
						})),
						max_tokens: options.maxTokens || 1000,
						temperature: options.temperature || 0.7,
					})

				newAssistantMessage = {
					role: 'AI',
					text:
						explainFurtherResponse.choices[0].message.content?.trim() ||
						'',
					timestamp: new Date().toISOString(),
				}
			} else {
				const bulletPointsResponse = await client.responses.create({
					model: 'gpt-4o-2024-08-06',
					input: updatedHistory.map(message => ({
						role: message.role === 'AI' ? 'assistant' : 'user',
						content: message.text,
					})),
					text: {
						format: {
							type: 'json_schema',
							name: 'math_reasoning',
							schema: {
								type: 'object',
								properties: {
									steps: {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												explanation: { type: 'string' },
												output: { type: 'string' },
											},
											required: ['explanation', 'output'],
											additionalProperties: false,
										},
									},
									final_answer: { type: 'string' },
								},
								required: ['steps', 'final_answer'],
								additionalProperties: false,
							},
							strict: true,
						},
					},
				})

				const output = JSON.parse(bulletPointsResponse.output_text)
				newAssistantMessage = {
					role: 'AI',
					bulletPoints: output.steps,
					text: output.final_answer,
					timestamp: new Date().toISOString(),
				}
			}

			setMessages([...updatedHistory, newAssistantMessage])

			return newAssistantMessage
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
