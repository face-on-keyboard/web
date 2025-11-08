import type { TravelMode } from '@prisma/client'

export function getTravelMode(speed: number): {
  travelMode: TravelMode
  estimatedCO2: number
} {
  if (speed < 5) {
    return { travelMode: 'WALK', estimatedCO2: 0 }
  }

  if (speed < 25) {
    return { travelMode: 'BIKE', estimatedCO2: 0.1 }
  }

  if (speed < 80) {
    return { travelMode: 'SCOOTER', estimatedCO2: 0.2 }
  }

  return { travelMode: 'CAR', estimatedCO2: 0.5 }
}
