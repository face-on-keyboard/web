function getColor(colorName: string) {
	// Create a temporary element to get computed styles
	const tempElement = document.createElement('div')
	document.body.appendChild(tempElement)

	// Get the computed style of the body (or any element where the variables are defined)
	const computedStyle = getComputedStyle(tempElement)

	// Get the value of the CSS variable
	const colorValue = computedStyle
		.getPropertyValue(`--color-${colorName}`)
		.trim()

	// Remove the temporary element
	document.body.removeChild(tempElement)

	return colorValue
}
