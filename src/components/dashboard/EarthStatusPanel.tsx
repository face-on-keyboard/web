import type { ChangeEvent } from 'react'

import { EarthStatus } from './EarthStatus'

interface EarthStatusPanelProps {
  emissionValue: number
  baseEmission: number
  testEmission: number | null
  onTestEmissionChange: (value: number | null) => void
}

const SLIDER_MIN = 0
const SLIDER_MAX = 250
const SLIDER_STEP = 0.1

export const EarthStatusPanel = ({
  emissionValue,
  baseEmission,
  testEmission,
  onTestEmissionChange,
}: EarthStatusPanelProps) => {
  const rawSliderValue = testEmission ?? baseEmission
  const sliderValue = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, rawSliderValue))

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    onTestEmissionChange(Number.isNaN(nextValue) ? null : nextValue)
  }

  const handleReset = () => {
    onTestEmissionChange(null)
  }

  return (
    <section className='mb-4 rounded-lg bg-white p-4 shadow-sm'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-foreground-primary'>今日地球狀態</h2>
          <p className='mt-1 text-xs text-foreground-muted'>
            根據碳排放級距切換不同的地球圖示，感受環境壓力變化。
          </p>
        </div>
        <div className='text-right'>
          <div className='text-xs text-foreground-muted'>目前碳排量（kg CO₂）</div>
          <div className='text-xl font-semibold text-primary-600'>
            {emissionValue.toFixed(1)}
          </div>
          {testEmission !== null && (
            <button
              type='button'
              onClick={handleReset}
              className='mt-1 text-[11px] font-semibold text-primary-600 underline-offset-2 hover:underline'
            >
              恢復實際數據
            </button>
          )}
        </div>
      </div>

      <EarthStatus emissionValue={emissionValue} />

      <div className='mt-5'>
        <label
          htmlFor='emission-test-slider'
          className='mb-1 flex items-center justify-between text-xs text-foreground-muted'
        >
          <span>測試用碳排量調整軸</span>
          <span>{sliderValue.toFixed(1)} kg</span>
        </label>
        <input
          id='emission-test-slider'
          type='range'
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={sliderValue}
          onChange={handleSliderChange}
          className='h-2 w-full cursor-pointer appearance-none rounded-full bg-grey-100 accent-primary-500'
        />
        <div className='mt-2 flex justify-between text-[11px] text-foreground-muted'>
          <span>{SLIDER_MIN}</span>
          <span>{SLIDER_MAX}</span>
        </div>
        <p className='mt-2 text-xs text-foreground-muted'>
          拖曳滑桿即可模擬不同碳排狀況，觀察地球圖示即時變化。
        </p>
      </div>
    </section>
  )
}


