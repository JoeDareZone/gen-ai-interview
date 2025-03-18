import { useOpenAI } from '@/hooks/useChatConversation'
import { StatusBar } from 'expo-status-bar'
import {
	ActivityIndicator,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

export default function ChatScreen() {
	const { completion, isLoading, error, generateCompletion } = useOpenAI()

	return (
		<SafeAreaView className='flex-1 bg-white'>
			<StatusBar style='dark' />
			<ScrollView className='flex-1 px-4'>
				<View className='flex-1 items-center justify-center py-8'>
					<Text className='text-2xl font-bold text-gray-800 mb-6'>
						AI Story Generator
					</Text>

					<TouchableOpacity
						onPress={() => {
							generateCompletion(
								'Write a one-sentence bedtime story about a unicorn.'
							)
						}}
						disabled={isLoading}
						className={`px-6 py-3 rounded-full ${
							isLoading
								? 'bg-gray-300'
								: 'bg-blue-500 active:bg-blue-600'
						}`}
					>
						<Text className='text-white font-semibold text-lg'>
							{isLoading ? 'Generating...' : 'Generate Story'}
						</Text>
					</TouchableOpacity>

					{isLoading && (
						<View className='mt-6'>
							<ActivityIndicator size='large' color='#3b82f6' />
						</View>
					)}

					{error && (
						<View className='mt-4 px-4 py-2 bg-red-100 rounded-lg'>
							<Text className='text-red-600 text-center'>
								Error: {error.message}
							</Text>
						</View>
					)}

					{completion && (
						<View className='mt-6 p-4 bg-blue-50 rounded-lg w-full'>
							<Text className='text-gray-800 text-lg leading-relaxed'>
								{completion}
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
