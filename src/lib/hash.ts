export function stringToNumberHash(str: string) {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i) // Get the Unicode value of the character
		hash = (hash << 5) - hash + char // Combine the character with the existing hash
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}
