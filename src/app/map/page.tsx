'use client'

import { useLocation } from '@/components/fetchers/location'
import { Layer, Map as MapLibre, Source } from '@vis.gl/react-maplibre'
import type { LineLayerSpecification } from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection } from 'geojson'

export default function MapPage() {
  const { data } = useLocation()

  const segmentsGeoJson: FeatureCollection = {
    type: 'FeatureCollection',
    features:
      data?.segments.map((segment) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [segment.start_x, segment.start_y],
            [segment.end_x, segment.end_y],
          ],
        },
        properties: {
          start: segment.start_time,
          end: segment.end_time,
        },
      })) ?? [],
  }

  const lineLayerStyle: LineLayerSpecification = {
    type: 'line',
    id: 'history',
    source: 'history-data',
    paint: {
      'line-dasharray': [5, 5],
      'line-width': 2,
      'line-color': '#e7a43c', // --color-secondary-600
    },
  }

  return (
    <MapLibre
      initialViewState={{
        longitude: 121.53846517738258,
        latitude: 25.044896295744145,
        zoom: 12,
      }}
      style={{ width: '100%', height: 'var(--screen-height-mobile)' }}
      mapStyle='/assets/map.json'
      maplibreLogo={false}
      attributionControl={false}
    >
      <Source id='history-data' type='geojson' data={segmentsGeoJson}>
        <Layer {...lineLayerStyle} />
      </Source>
    </MapLibre>
  )
}
