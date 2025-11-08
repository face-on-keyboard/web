interface ErrorBannerProps {
	message: string
}

export const ErrorBanner = ({ message }: ErrorBannerProps) => {
	if (!message) return null

	return (
		<div className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-600 text-sm'>
			⚠️ {message}
		</div>
	)
}
