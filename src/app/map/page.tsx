'use client'

import { useLocation } from '@/components/fetchers/location'
import { Layer, Map as MapLibre, Source } from '@vis.gl/react-maplibre'
import type {
  CircleLayerSpecification,
  LineLayerSpecification,
} from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection } from 'geojson'

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
        },
      })) ?? [],
  }

  const segmentsLineLayer: LineLayerSpecification = {
    type: 'line',
    id: 'history',
    source: 'history-data',
    paint: {
      'line-width': 5,
      'line-color': '#468D9B', // --color-primary-600
    },
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

  return (
    <>
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
          <Layer {...segmentsLineLayer} />
          <Layer {...segmentEndpointsLayer} />
        </Source>
        <Source
          id='green-restaurants'
          type='geojson'
          data='/layers/green-restaurants.geojson'
        >
          <Layer {...greenRestaurantsLayer} />
        </Source>
      </MapLibre>
    </>
  )
}
