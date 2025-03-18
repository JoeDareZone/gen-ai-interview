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
			text: `You are a friendly educational tutor. The student is in grade ${
				options.studentProfile?.grade || '7'
			}. Provide super basic, clear answers using a ${
				options.studentProfile?.aiPersonality || 'friendly'
			} tone. Your response should include three very simple bullet points, each beginning with a heading like "Step 1:", "Step 2:", and "Step 3:", the bullet points should be short and to the point. Use relatable examples. Return your answer in JSON format using the provided schema.`,
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
			const reponse = await client.responses.create({
				model: 'gpt-4o-mini-2024-07-18',
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
											heading: { type: 'string' },
											explanation: { type: 'string' },
											output: { type: 'string' },
										},
										required: [
											'heading',
											'explanation',
											'output',
										],
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
			const output = JSON.parse(reponse.output_text)

			if (type === 'explainFurther') {
				console.log('output', output)
				newAssistantMessage = {
					role: 'AI',
					bulletPoints: output.steps,
					text: output.final_answer,
					timestamp: new Date().toISOString(),
				}
			} else {
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
