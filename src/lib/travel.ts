export interface TravelSegment {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  fromTime: string
  toTime: string
  estimatedCO2: number
  travelMode?: string | null
  userEmail?: string | null
}

export type SegmentsByDate = Record<string, TravelSegment[]>

export const CAR_CO2_PER_KM = 0.192

export const toDateKey = (isoString: string): string => {
  if (!isoString) return ''
  return isoString.slice(0, 10)
}

export const groupSegmentsByDate = (
  segments: TravelSegment[],
): SegmentsByDate => {
  return segments.reduce<SegmentsByDate>((acc, segment) => {
    const key = toDateKey(segment.fromTime)
    if (!key) return acc
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(segment)
    return acc
  }, {})
}

export const sumEstimatedCO2 = (segments: TravelSegment[]): number => {
  return segments.reduce((sum, segment) => sum + (segment.estimatedCO2 ?? 0), 0)
}

export const filterSegmentsByDateRange = (
  segments: TravelSegment[],
  startDate?: string,
  endDate?: string,
): TravelSegment[] => {
  if (!startDate && !endDate) return segments

  const start = startDate ? new Date(startDate) : undefined
  const end = endDate ? new Date(endDate) : undefined

  return segments.filter((segment) => {
    const date = new Date(segment.fromTime)
    if (Number.isNaN(date.getTime())) return false

    if (start && date < start) return false
    if (end) {
      const endBoundary = new Date(end)
      endBoundary.setHours(23, 59, 59, 999)
      if (date > endBoundary) return false
    }
    return true
  })
}

export const carCo2FromWalkingMeters = (distanceMeters: number): number => {
  const distanceKm = distanceMeters / 1000
  return Number((distanceKm * CAR_CO2_PER_KM).toFixed(3))
}

