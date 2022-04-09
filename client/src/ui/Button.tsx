import { useMemo, MouseEvent } from 'react'
import cn from 'classnames'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'error' | 'warning' | 'success'
  tag?: 'a' | 'div' | 'button'
  shadow?: boolean
  center?: boolean
  padding?: boolean
  outline?: boolean
  semitransparent?: boolean
  circle?: boolean
  icon?: JSX.Element | string | number | SVGElement
  label?: JSX.Element | string | number
  onClick?: (e: MouseEvent<HTMLDivElement | HTMLButtonElement>) => void
  className?: string
}

export const ButtonLabelBuilder = ({
  label,
  icon,
}: Pick<ButtonProps, 'label' | 'icon'>) => (
  <div className='flex space-x-3 items-center'>
    {icon}
    {label ? <div>{label}</div> : null}
  </div>
)

export const Button = ({
  variant = 'primary',
  shadow = true,
  center = true,
  padding = true,
  outline = false,
  semitransparent = false,
  circle = false,
  icon, // its worth to pass w-5 h-5 in svg element
  label,
  onClick,
  className,
}: ButtonProps) => {
  const classes = useMemo(
    () => [
      {
        'flex items-center justify-center': center,
        'px-7': padding && !circle,
        'shadow-lg media-hover:hover:shadow-sm active:shadow-sm':
          shadow && !outline && !semitransparent,
        border: outline,
        'w-12 rounded-full': circle,
        'rounded-xl': !circle,
      },
      outline
        ? {
            'border-violet-500 text-violet-500 media-hover:hover:border-violet-600 media-hover:hover:text-violet-600':
              variant === 'primary',
            'border-zinc-500 text-zinc-500 media-hover:hover:border-zinc-600 media-hover:hover:text-zinc-600':
              variant === 'secondary',
            'border-red-500 text-red-500 media-hover:hover:border-red-600 media-hover:hover:text-red-600':
              variant === 'error',
            'border-amber-500 text-amber-500 media-hover:hover:border-amber-600 media-hover:hover:text-amber-600':
              variant === 'warning',
            'border-green-500 text-green-500 media-hover:hover:border-green-600 media-hover:hover:text-green-600':
              variant === 'success',
          }
        : {
            'bg-violet-500 text-white media-hover:hover:bg-violet-600':
              variant === 'primary',
            'bg-zinc-200 text-zinc-700 media-hover:hover:bg-zinc-200':
              variant === 'secondary',
            'bg-rose-400 text-white media-hover:hover:bg-rose-500':
              variant === 'error',
            'bg-amber-500 text-white media-hover:hover:bg-amber-600':
              variant === 'warning',
            'bg-green-500 text-white media-hover:hover:bg-green-600':
              variant === 'success',
            'bg-opacity-80': semitransparent,
          },
    ],
    [variant, semitransparent, outline, circle, center, padding, shadow],
  )

  return (
    <button
      className={`${cn(
        className,
        classes,
      )} group relative h-12 select-none overflow-hidden transition-all duration-100 active:translate-y-[1px] active:shadow-none cursor-pointer touch-manipulation`}
      onTouchStart={undefined}
      onClick={e => onClick?.(e)}
    >
      <ButtonLabelBuilder label={label} icon={icon} />
    </button>
  )
}
