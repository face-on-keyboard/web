'use client'

import { useEffect, useMemo, useState } from 'react'

import { Layer, Map as MapLibre, Source } from '@vis.gl/react-maplibre'
import type {
  CircleLayerSpecification,
  LineLayerSpecification,
} from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection } from 'geojson'

import { useLocation } from '@/components/fetchers/location'
import { useHealth } from '@/components/fetchers/health'
import {
  carCo2FromWalkingMeters,
  filterSegmentsByDateRange,
  groupSegmentsByDate,
  sumEstimatedCO2,
  toDateKey,
  type TravelSegment,
} from '@/lib/travel'

const COLOR_PALETTE = [
  '#e7a43c',
  '#4caf50',
  '#2196f3',
  '#9c27b0',
  '#ff5722',
  '#607d8b',
] as const

const lineLayerStyle: LineLayerSpecification = {
  type: 'line',
  id: 'history',
  source: 'history-data',
  paint: {
    'line-width': 5,
    'line-color': ['coalesce', ['get', 'color'], '#e7a43c'],
  },
}

const pointLayerStyle: CircleLayerSpecification = {
  type: 'circle',
  id: 'history-points',
  source: 'history-data',
  paint: {
    'circle-radius': 6,
    'circle-color': ['coalesce', ['get', 'color'], '#e7a43c'],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
}

const formatKg = (value: number | undefined) => {
  if (value === undefined) return '0.00'
  return value.toFixed(2)
}

const formatKm = (value: number) => value.toFixed(2)

const getAvailableDates = (segments: TravelSegment[] = []) => {
  return Array.from(
    new Set(
      segments
        .map((segment) => toDateKey(segment.fromTime))
        .filter((key) => !!key),
    ),
  ).sort((a, b) => (a > b ? 1 : -1))
}

export default function MapPage() {
  const { segments } = useLocation()
  const { health } = useHealth()

  const availableDates = useMemo(
    () => getAvailableDates(segments ?? []),
    [segments],
  )

  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()

  useEffect(() => {
    if (availableDates.length === 0) return
    setStartDate((prev) => prev ?? availableDates[0])
    setEndDate((prev) => prev ?? availableDates[availableDates.length - 1])
  }, [availableDates])

  const filteredSegments = useMemo(() => {
    if (!segments) return []
    return filterSegmentsByDateRange(segments, startDate, endDate)
  }, [segments, startDate, endDate])

  const groupedSegments = useMemo(
    () => groupSegmentsByDate(filteredSegments),
    [filteredSegments],
  )

  const dateKeys = useMemo(
    () => Object.keys(groupedSegments).sort((a, b) => (a > b ? 1 : -1)),
    [groupedSegments],
  )

  const colorMap = useMemo(() => {
    return dateKeys.reduce<Record<string, string>>((acc, date, index) => {
      const color =
        COLOR_PALETTE[index % COLOR_PALETTE.length] ?? COLOR_PALETTE[0]
      acc[date] = color
      return acc
    }, {})
  }, [dateKeys])

  const segmentsGeoJson: FeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: filteredSegments.map((segment) => {
        const dateKey = toDateKey(segment.fromTime)
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [segment.startX, segment.startY],
              [segment.endX, segment.endY],
            ],
          },
          properties: {
            start: segment.fromTime,
            end: segment.toTime,
            color: colorMap[dateKey] ?? COLOR_PALETTE[0],
            date: dateKey,
            estimatedCO2: segment.estimatedCO2,
          },
        }
      }),
    }),
    [filteredSegments, colorMap],
  )

  const totalCO2 = useMemo(
    () => sumEstimatedCO2(filteredSegments),
    [filteredSegments],
  )

  const dailySummaries = useMemo(
    () =>
      dateKeys.map((date) => {
        const dailySegments = groupedSegments[date] ?? []
        return {
          date,
          co2: sumEstimatedCO2(dailySegments),
          count: dailySegments.length,
        }
      }),
    [dateKeys, groupedSegments],
  )

  const distanceKm = (health?.distance_meters ?? 0) / 1000
  const healthCarCo2 = carCo2FromWalkingMeters(health?.distance_meters ?? 0)

  const handleStartDateChange = (value: string) => {
    if (!value) return
    if (endDate && value > endDate) {
      setEndDate(value)
    }
    setStartDate(value)
  }

  const handleEndDateChange = (value: string) => {
    if (!value) return
    if (startDate && value < startDate) {
      setStartDate(value)
    }
    setEndDate(value)
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <MapLibre
        initialViewState={{
          longitude: 121.53571578876608,
          latitude: 25.02147971575624,
          zoom: 15,
        }}
        style={{ width: '100%', height: 'var(--screen-height-mobile)' }}
        mapStyle='/assets/map.json'
        maplibreLogo={false}
        attributionControl={false}
      >
        <Source id='history-data' type='geojson' data={segmentsGeoJson}>
          <Layer {...lineLayerStyle} />
          <Layer {...pointLayerStyle} />
        </Source>
      </MapLibre>

      <div className='mt-2 rounded-t-2xl bg-white p-4 shadow-lg'>
        <div className='mb-4 grid grid-cols-2 gap-3'>
          <label className='flex flex-col text-xs text-foreground-muted'>
            開始日期
            <input
              type='date'
              className='mt-1 rounded-md border border-grey-200 px-2 py-1 text-sm text-foreground-primary'
              value={startDate ?? ''}
              onChange={(event) => handleStartDateChange(event.target.value)}
              min={availableDates[0] ?? ''}
              max={endDate ?? availableDates[availableDates.length - 1] ?? ''}
            />
          </label>
          <label className='flex flex-col text-xs text-foreground-muted'>
            結束日期
            <input
              type='date'
              className='mt-1 rounded-md border border-grey-200 px-2 py-1 text-sm text-foreground-primary'
              value={endDate ?? ''}
              onChange={(event) => handleEndDateChange(event.target.value)}
              min={startDate ?? availableDates[0] ?? ''}
              max={availableDates[availableDates.length - 1] ?? ''}
            />
          </label>
        </div>

        <div className='mb-4 rounded-lg border border-grey-200 p-3'>
          <div className='flex items-center justify-between text-sm font-semibold text-foreground-primary'>
            篩選結果總碳排
            <span>{formatKg(totalCO2)} kg CO₂</span>
          </div>
          <div className='mt-2 text-xs text-foreground-muted'>
            選取期間共有 {filteredSegments.length} 筆行程資料。
          </div>
        </div>

        <div className='mb-4 rounded-lg border border-grey-200 p-3'>
          <div className='text-sm font-semibold text-foreground-primary'>
            健康資料
          </div>
          <div className='mt-2 grid grid-cols-2 gap-2 text-xs text-foreground-muted'>
            <div className='rounded-md bg-background-muted px-2 py-2'>
              <div className='font-semibold text-foreground-primary'>步數</div>
              <div className='mt-1 text-lg font-semibold text-primary-600'>
                {health?.steps ?? 0}
              </div>
            </div>
            <div className='rounded-md bg-background-muted px-2 py-2'>
              <div className='font-semibold text-foreground-primary'>距離</div>
              <div className='mt-1 text-lg font-semibold text-primary-600'>
                {formatKm(distanceKm)} km
              </div>
            </div>
            <div className='col-span-2 rounded-md bg-primary-50 px-2 py-2'>
              <div className='font-semibold text-primary-700'>汽車等效碳排</div>
              <div className='mt-1 text-lg font-semibold text-primary-700'>
                {formatKg(healthCarCo2)} kg CO₂
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          {dailySummaries.map(({ date, co2, count }) => (
            <div
              key={date}
              className='rounded-lg border border-grey-200 px-3 py-2 text-sm text-foreground-primary'
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: colorMap[date] ?? COLOR_PALETTE[0],
              }}
            >
              <div className='flex items-center justify-between'>
                <span className='font-semibold'>{date}</span>
                <span className='text-xs text-foreground-muted'>
                  {count} 筆路線
                </span>
              </div>
              <div className='mt-1 text-xs text-foreground-muted'>
                碳排 {formatKg(co2)} kg CO₂
              </div>
            </div>
          ))}
          {dailySummaries.length === 0 && (
            <div className='rounded-lg border border-dashed border-grey-200 px-3 py-4 text-center text-sm text-foreground-muted'>
              尚無符合日期範圍的路線資料。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
