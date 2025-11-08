import type { Feature, Geometry } from 'geojson'
import type { JSX } from 'react'

export function FeaturePopup<T>({
  feature,
  columns,
  title,
}: {
  feature: Feature<Geometry, T>
  columns: (
    | { label: string; description?: string; value: string | number }
    | { label: string; description?: string; render: () => JSX.Element }
  )[]
  title: string
}) {
  return (
    <>
      <h1 className='mx-4 my-2 font-bold font-sans text-lg'>{title}</h1>
      <div className='mx-4 space-y-0 font-sans'>
        {columns.map((prop, index) => (
          <div
            key={prop.label}
            className={'flex flex-row justify-between py-2'}
          >
            <div className='w-1/3 font-regular text-tr-text'>
              {prop.label}
              {prop.description && (
                <span className='block font-light text-[8px] text-tr-text/80'>
                  {prop.description}
                </span>
              )}
            </div>
            <div className='w-2/3 text-right font-regular'>
              {'render' in prop ? (
                prop.render()
              ) : (
                <span>{prop.value ?? '無資料'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
