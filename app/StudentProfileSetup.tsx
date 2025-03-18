import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

interface StudentProfile {
	grade: string
	aiPersonality: string
}

const gradeOptions = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
const personalityOptions = ['Friendly', 'Strict', 'Encouraging', 'Laid-back']

export default function StudentProfileSetup() {
	const { chatId } = useLocalSearchParams()
	const [grade, setGrade] = useState<string>('')
	const [aiPersonality, setAiPersonality] = useState<string>('')
	const router = useRouter()

	const handleStartChat = () => {
		router.push(
			`/chat/${chatId}?grade=${grade}&aiPersonality=${aiPersonality}`
		)
	}

	return (
		<SafeAreaView className='flex-1 bg-white'>
			<View className='px-4 pt-4'>
				<Text className='text-2xl font-bold text-gray-800 mb-12'>
					Tell us about yourself
				</Text>

				{/* Grade selection */}
				<Text className='text-lg font-medium text-gray-700 mb-2'>
					Select your grade:
				</Text>
				<View className='flex-row flex-wrap mb-4'>
					{gradeOptions.map(option => (
						<TouchableOpacity
							key={option}
							onPress={() => setGrade(option)}
							className={`px-4 py-2 m-1 rounded-full border ${
								grade === option
									? 'bg-purple-700 border-purple-700'
									: 'bg-white border-gray-300'
							}`}
						>
							<Text
								className={`text-sm ${
									grade === option
										? 'text-white'
										: 'text-gray-800'
								}`}
							>
								{option}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Personality selection */}
				<Text className='text-lg font-medium text-gray-700 mb-2'>
					Choose your AI personality:
				</Text>
				<View className='flex-row flex-wrap mb-12'>
					{personalityOptions.map(option => (
						<TouchableOpacity
							key={option}
							onPress={() => setAiPersonality(option)}
							className={`px-4 py-2 m-1 rounded-full border ${
								aiPersonality === option
									? 'bg-purple-700 border-purple-700'
									: 'bg-white border-gray-300'
							}`}
						>
							<Text
								className={`text-sm ${
									aiPersonality === option
										? 'text-white'
										: 'text-gray-800'
								}`}
							>
								{option}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Start Chat Button */}
				<TouchableOpacity
					onPress={handleStartChat}
					disabled={!grade || !aiPersonality}
					className={`w-full p-4 rounded-lg items-center ${
						grade && aiPersonality ? 'bg-purple-700' : 'bg-gray-400'
					}`}
				>
					<Text className='text-white text-lg font-bold'>
						Start Chat
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}
