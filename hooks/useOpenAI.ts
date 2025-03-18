import OpenAI from 'openai'
import { useState } from 'react'

interface UseOpenAIOptions {
	model?: string
	maxTokens?: number
	temperature?: number
}

interface UseOpenAIResult {
	completion: string | null
	isLoading: boolean
	error: Error | null
	generateCompletion: (prompt: string) => Promise<string>
}

export function useOpenAI(options: UseOpenAIOptions = {}): UseOpenAIResult {
	const [completion, setCompletion] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const client = new OpenAI({
		apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
	})

	const generateCompletion = async (prompt: string): Promise<string> => {
		console.log('Generating completion...')
		try {
			setIsLoading(true)
			setError(null)

			const response = await client.chat.completions.create({
				model: options.model || 'gpt-4',
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
				max_tokens: options.maxTokens || 1000,
				temperature: options.temperature || 0.7,
			})

			if (
				response &&
				response.choices &&
				response.choices[0] &&
				response.choices[0].message &&
				response.choices[0].message.content
			) {
				const generatedText = response.choices[0].message.content.trim()
				setCompletion(generatedText)
				console.log('Completion generated:', generatedText)
				return generatedText
			} else {
				throw new Error('Invalid response structure')
			}
		} catch (err) {
			const errorObj =
				err instanceof Error ? err : new Error('An error occurred')
			setError(errorObj)
			throw errorObj
		} finally {
			setIsLoading(false)
		}
	}

	return {
		completion,
		isLoading,
		error,
		generateCompletion,
	}
}
