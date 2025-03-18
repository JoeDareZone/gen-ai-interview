// useWikimediaImage.ts
import { useState } from 'react'

interface ImageSize {
	width: number
	height: number
}

export function useWikimediaImage() {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const fetchImage = async (
		query: string,
		preferredSize: ImageSize = { width: 800, height: 600 }
	): Promise<string | null> => {
		setIsLoading(true)
		setError(null)
		try {
			// Clean and format the query
			const formattedQuery = query.trim().replace(/\s+/g, ' ')

			// First try to get a direct image search
			const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
				formattedQuery
			)}+filetype:image&srlimit=10&srnamespace=6`

			console.log('Searching with URL:', searchUrl)

			const searchResponse = await fetch(searchUrl)

			if (!searchResponse.ok) {
				throw new Error(`HTTP error! status: ${searchResponse.status}`)
			}

			const searchData = await searchResponse.json()
			console.log('Search response:', JSON.stringify(searchData, null, 2))

			if (!searchData.query?.search?.length) {
				// Try a more general search without filetype restriction
				const fallbackUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
					formattedQuery
				)}&srlimit=10&srnamespace=6`

				console.log('Trying fallback search with URL:', fallbackUrl)
				const fallbackResponse = await fetch(fallbackUrl)
				const fallbackData = await fallbackResponse.json()

				if (!fallbackData.query?.search?.length) {
					throw new Error(
						`No images found for query: "${formattedQuery}". Try a different search term.`
					)
				}

				searchData.query.search = fallbackData.query.search
			}

			// Try each search result until we find a suitable image
			for (const result of searchData.query.search) {
				const title = result.title
				console.log('Trying image:', title)

				// Get detailed image info - use the raw title without additional encoding
				const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|size|dimensions&titles=${title}`

				console.log('Fetching image info from:', imageUrl)
				const imageResponse = await fetch(imageUrl)

				if (!imageResponse.ok) {
					console.log('Failed to fetch image info for:', title)
					continue // Try next result if this one fails
				}

				const imageData = await imageResponse.json()
				console.log(
					'Image info response:',
					JSON.stringify(imageData, null, 2)
				)

				const pages = imageData.query.pages
				const page = pages[Object.keys(pages)[0]]

				if (page?.imageinfo?.[0]) {
					const imageInfo = page.imageinfo[0]
					const url = imageInfo.url

					// Check if the image dimensions are suitable
					if (
						imageInfo.width >= preferredSize.width &&
						imageInfo.height >= preferredSize.height
					) {
						console.log('Found suitable image:', url)
						setImageUrl(url)
						return url
					} else {
						console.log(
							'Image dimensions not suitable:',
							imageInfo.width,
							'x',
							imageInfo.height
						)
					}
				}
			}

			// If we get here, we didn't find a suitable image
			throw new Error(
				`No suitable images found matching the size requirements (${preferredSize.width}x${preferredSize.height})`
			)
		} catch (err: any) {
			console.error('Error fetching Wikimedia image:', err)
			setError(err.message || 'Failed to fetch image')
			return null
		} finally {
			setIsLoading(false)
		}
	}

	return { imageUrl, error, isLoading, fetchImage }
}
