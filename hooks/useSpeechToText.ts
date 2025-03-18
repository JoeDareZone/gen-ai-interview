// useSpeechToText.ts
import Voice, {
	SpeechErrorEvent,
	SpeechRecognizedEvent,
	SpeechResultsEvent,
} from '@react-native-voice/voice'
import { useEffect, useState } from 'react'

export function useSpeechToText() {
	const [isListening, setIsListening] = useState(false)
	const [isRecognized, setIsRecognized] = useState(false)
	const [transcript, setTranscript] = useState('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		Voice.onSpeechStart = (e: any) => {
			setIsListening(true)
		}

		// Called when speech is recognized.
		Voice.onSpeechRecognized = (e: SpeechRecognizedEvent) => {
			setIsRecognized(true)
		}

		// Called when the speech recognition ends.
		Voice.onSpeechEnd = (e: any) => {
			setIsListening(false)
			setIsRecognized(false)
		}

		// Called when an error occurs.
		Voice.onSpeechError = (e: SpeechErrorEvent) => {
			setError(e.error?.message || 'Unknown error')
			setIsListening(false)
			setIsRecognized(false)
		}

		// Called when speech recognition results are available.
		Voice.onSpeechResults = (e: SpeechResultsEvent) => {
			if (e.value && e.value.length > 0) {
				setTranscript(e.value[0])
			}
		}
		return () => {
			Voice.destroy().then(Voice.removeAllListeners)
		}
	}, [])

	const startListening = async () => {
		setTranscript('')
		setError(null)
		try {
			await Voice.start('en-US')
		} catch (err) {
			console.error('Error starting speech recognition:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to start speech recognition'
			)
			setIsListening(false)
		}
	}

	const stopListening = async () => {
		try {
			await Voice.stop()
		} catch (err) {
			console.error('Error stopping speech recognition:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Failed to stop speech recognition'
			)
		}
	}

	return {
		isListening,
		isRecognized,
		transcript,
		error,
		startListening,
		stopListening,
	}
}
