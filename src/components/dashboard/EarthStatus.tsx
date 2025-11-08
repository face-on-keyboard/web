import Image from 'next/image'

const EARTH_TIERS = [
  {
    max: 100,
    image: '/earths/earth1.png',
    title: '綠意盎然',
    message: '今日碳排表現極佳，地球鬆了一口氣。',
    animation: 'animate-earth-sway',
    rangeLabel: '低於 100 kg CO₂',
  },
  {
    max: 150,
    image: '/earths/earth2.png',
    title: '微幅波動',
    message: '碳排仍在舒適範圍，再多注意就更好了。',
    animation: 'animate-earth-pulse',
    rangeLabel: '100–150 kg CO₂',
  },
  {
    max: 180,
    image: '/earths/earth3.png',
    title: '需要留意',
    message: '碳排有些上升，建議檢視日常習慣。',
    animation: 'animate-earth-pulse-strong',
    rangeLabel: '150–180 kg CO₂',
  },
  {
    max: 200,
    image: '/earths/earth4.png',
    title: '拉起警報',
    message: '碳排已偏高，試著尋找減量的可能。',
    animation: 'animate-earth-shiver',
    rangeLabel: '180–200 kg CO₂',
  },
  {
    max: Number.POSITIVE_INFINITY,
    image: '/earths/earth5.png',
    title: '緊急狀態',
    message: '碳排超過 200 kg，地球正在搖晃，需要立即行動。',
    animation: 'animate-earth-shake',
    rangeLabel: '高於 200 kg CO₂',
  },
] as const

interface EarthStatusProps {
  emissionValue: number
}

export const EarthStatus = ({ emissionValue }: EarthStatusProps) => {
  const tier = (
    EARTH_TIERS.find(({ max }) => emissionValue < max) ??
    EARTH_TIERS[EARTH_TIERS.length - 1]
  ) as (typeof EARTH_TIERS)[number]

  return (
    <div className='flex flex-col items-center text-center'>
      <div className={`relative flex h-44 w-44 items-center justify-center ${tier.animation}`}>
        <Image
          src={tier.image}
          alt={`${tier.title} 地球`}
          width={176}
          height={176}
          priority
        />
      </div>
      <div className='mt-3 text-sm font-semibold text-foreground-primary'>{tier.title}</div>
      <div className='mt-1 text-xs text-foreground-muted'>{tier.message}</div>
      <div className='mt-2 rounded-full bg-grey-100 px-3 py-1 text-[11px] font-medium text-foreground-secondary'>
        對應範圍：{tier.rangeLabel}
      </div>
    </div>
  )
}


