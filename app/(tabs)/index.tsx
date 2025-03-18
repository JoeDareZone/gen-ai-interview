import { useOpenAI } from '@/hooks/useOpenAI'
import { SafeAreaView, Text, TouchableOpacity } from 'react-native'

export default function HomeScreen() {
	const { completion, isLoading, error, generateCompletion } = useOpenAI()

	return (
		<SafeAreaView className='flex-1 items-center justify-center'>
			<Text>Hello</Text>
			<TouchableOpacity
				onPress={() => {
					generateCompletion(
						'Write a one-sentence bedtime story about a unicorn.'
					)
				}}
			>
				<Text>Click me</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
