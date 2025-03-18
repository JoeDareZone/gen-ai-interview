import { useFirestore } from '@/context/FirestoreContext'
import { useRouter } from 'expo-router'
import { SafeAreaView, Text, TouchableOpacity } from 'react-native'
import uuid from 'react-native-uuid'

export default function HomeScreen() {
	const router = useRouter()
	const { addDocument } = useFirestore()

	const handleNewChat = async () => {
		const chatId = uuid.v4()
		await addDocument('chats', {
			chatId,
			createdAt: new Date().toISOString(),
		})

		router.push(`/chat/${chatId}`)
	}

	return (
		<SafeAreaView className='flex-1 bg-white'>
			<TouchableOpacity
				onPress={handleNewChat}
				className='bg-blue-500 p-4 rounded-lg m-4'
			>
				<Text className='text-white text-center text-lg font-bold'>
					Start New Chat
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	)
}
