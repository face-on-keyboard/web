'use client'

import { useLocation } from '@/components/fetchers/location'
import { Layer, Map as MapLibre, Source, useMap } from '@vis.gl/react-maplibre'
import type {
  CircleLayerSpecification,
  LineLayerSpecification,
} from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection } from 'geojson'
import maplibregl from 'maplibre-gl'
import { useEffect, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { FeaturePopup } from '@/components/map-popup'
import { useHealth } from '@/components/fetchers/health'
import { TravelMode } from '@prisma/client'
import { carEmissionMultiplier } from '@/lib/speed'

export default function MapPage() {
  const { segments } = useLocation()

  const segmentsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features:
      segments?.map((segment) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [segment.startX, segment.startY],
            [segment.endX, segment.endY],
          ],
        },
        properties: {
          start: segment.fromTime,
          end: segment.toTime,
          travelMode: segment.travelMode,
        },
      })) ?? [],
  }

  const { health } = useHealth()

  const segmentsLineWalkLayer: LineLayerSpecification = {
    type: 'line',
    id: 'history-walk',
    source: 'history-data',
    paint: {
      'line-width': 5,
      'line-color': '#468d9b', // --color-primary-600
    },
    filter: ['==', ['get', 'travelMode'], TravelMode.WALK],
  }

  const segmentsLineBikeLayer: LineLayerSpecification = {
    type: 'line',
    id: 'history-bike',
    source: 'history-data',
    paint: {
      'line-width': 5,
      'line-color': '#22474e', // --color-primary-800
    },
    filter: ['==', ['get', 'travelMode'], TravelMode.BIKE],
  }

  const segmentsLineScooterLayer: LineLayerSpecification = {
    type: 'line',
    id: 'history-scooter',
    source: 'history-data',
    paint: {
      'line-width': 5,
      'line-color': '#e7a43c', // --color-secondary-600
    },
    filter: ['==', ['get', 'travelMode'], TravelMode.SCOOTER],
  }

  const segmentsLineCarLayer: LineLayerSpecification = {
    type: 'line',
    id: 'history-car',
    source: 'history-data',
    paint: {
      'line-width': 5,
      'line-color': '#74521b', // --color-secondary-600
    },
    filter: ['==', ['get', 'travelMode'], TravelMode.CAR],
  }

  const segmentEndpointsLayer: CircleLayerSpecification = {
    type: 'circle',
    id: 'history-points',
    source: 'history-data',
    paint: {
      'circle-radius': 6,
      'circle-color': '#468D9B', // --color-primary-600
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff', // --color-white
    },
  }

  const [expandList, setExpandList] = useState<boolean>(false)

  return (
    <>
      <div
        className={`absolute top-0 z-50 h-[190px] w-full bg-primary-50 shadow ${
          expandList ? 'h-[400px]' : ''
        }`}
      >
        <div className='space-y-3 py-2'>
          交通產生的碳排
          <div className='flex items-center space-x-2'>
            <div className='h-3 w-[250px] rounded-full bg-gray-200'>
              <div
                className='h-3 rounded-full bg-red-500'
                style={{
                  width: `${Math.min(
                    ((segments?.reduce(
                      (acc, segment) => acc + segment.estimatedCO2,
                      0
                    ) || 0) /
                      (((health?.steps ?? 0) * 1.42) / 1000 || 1)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className='font-medium text-sm'>
              {segments
                ?.reduce((acc, segment) => acc + segment.estimatedCO2, 0)
                .toFixed(2)}{' '}
              kg
            </div>
          </div>
          步行減碳
          <div className='flex items-center space-x-2'>
            <div className='h-3 w-[250px] rounded-full bg-gray-200'>
              <div
                className='h-3 rounded-full bg-green-500'
                style={{ width: '100%' }}
              />
            </div>
            <div className='font-medium text-sm'>
              {(((health?.steps ?? 0) * 1.42) / 1000).toFixed(2)} kg ·{' '}
              {health?.steps} 步
            </div>
          </div>
          <div className='flex w-full justify-end font-bold text-body'>
            相當開車同距離{' '}
            {(
              (((health?.steps ?? 0) * 1.42) / 1000) *
              carEmissionMultiplier
            ).toFixed(2)}{' '}
            kg CO₂
          </div>
        </div>
        <button
          onClick={() => setExpandList(!expandList)}
          className='mt-3 flex w-full justify-end font-medium text-primary-600 text-sm transition-colors hover:text-primary-700'
          type='button'
        >
          {expandList ? '▲ 收起' : '▼ 展開'}紀錄列表
        </button>
        {expandList && (
          <div className='mt-3 max-h-[200px] space-y-2 overflow-y-auto'>
            {segments?.map((segment) => (
              <div
                key={segment.id}
                className='rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-1 text-gray-500 text-xs'>
                      {new Date(segment.fromTime).toLocaleString('zh-TW', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' → '}
                      {new Date(segment.toTime).toLocaleString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className='text-caption text-foreground-muted'>
                      {segment.travelMode}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold text-red-600 text-sm'>
                      {segment.estimatedCO2.toFixed(2)} kg
                    </div>
                    <div className='text-gray-400 text-xs'>CO₂</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
          <Layer {...segmentsLineWalkLayer} />
          <Layer {...segmentsLineBikeLayer} />
          <Layer {...segmentsLineCarLayer} />
          <Layer {...segmentsLineScooterLayer} />
          <Layer {...segmentEndpointsLayer} />
        </Source>
        <Overlays />
      </MapLibre>
    </>
  )
}

function Overlays() {
  const { current: map } = useMap()

  const greenRestaurantsLayer: CircleLayerSpecification = {
    type: 'circle',
    id: 'green-restaurants-points',
    source: 'green-restaurants',
    paint: {
      'circle-radius': 6,
      'circle-color': '#e7a43c', // --color-secondary-600
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff', // --color-white
    },
  }

  useEffect(() => {
    if (!map) return
    map.on('click', 'green-restaurants-points', (e) => {
      const coordinates = e.lngLat
      const feature = e.features?.[0]

      if (!feature) return

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          renderToString(
            <FeaturePopup
              feature={feature}
              title={feature.properties.餐廳名稱}
              columns={[
                {
                  label: '餐廳電話',
                  value: feature.properties.餐廳電話 || '無資料',
                },
                {
                  label: '餐廳地址',
                  value: feature.properties.餐廳地址 || '無資料',
                },
              ]}
            />
          )
        )
        .addTo(map.getMap())
    })
  }, [map])

  return (
    <>
      <Source
        id='green-restaurants'
        type='geojson'
        data='/layers/green-restaurants.geojson'
      >
        <Layer {...greenRestaurantsLayer} />
      </Source>
    </>
  )
}
