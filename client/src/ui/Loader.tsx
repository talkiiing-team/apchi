import { LightningBoltIcon } from '@heroicons/react/outline'
import { memo } from 'react'

export const Loader = memo(
  ({
    className,
    iconClassName,
  }: {
    className?: string
    iconClassName?: string
  }) => {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${className}`}
      >
        <LightningBoltIcon
          className={`w-5 h-5 stroke-1 text-amber-500 animate-pulse pulse-fast ${
            iconClassName || ''
          }`}
        />
      </div>
    )
  },
)
