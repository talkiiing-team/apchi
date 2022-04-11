import { useMemo } from 'react'
import cn from 'classnames'
import { Button, ButtonLabelBuilder, ButtonProps } from './Button'

export interface SlideButtonProps extends ButtonProps {
  subLabel?: ButtonProps['label']
  subIcon?: ButtonProps['icon']
  scroll?: 'bottom' | 'right'
}

export const SlideButton = ({
  label,
  icon,
  subIcon,
  subLabel,
  scroll = 'bottom',
  ...passedProps
}: SlideButtonProps) => {
  const computedContent = useMemo(
    () => (
      <button
        className={`${cn({
          'h-[200%] w-full flex-col group-hover:-top-full': scroll === 'bottom',
          'h-full w-[200%] flex-row group-hover:-left-full': scroll === 'right',
        })} absolute top-0 left-0 right-0 bottom-0 flex transition-all duration-300 ease-in-out`}
      >
        <div
          className={`${cn({
            'h-1/2 w-full': scroll === 'bottom',
            'h-full w-1/2': scroll === 'right',
          })} flex items-center justify-center transition-all duration-300 group-hover:scale-0 group-hover:opacity-0`}
        >
          <ButtonLabelBuilder label={label} icon={icon} />
        </div>
        <div
          className={`${cn({
            'h-1/2 w-full': scroll === 'bottom',
            'h-full w-1/2': scroll === 'right',
          })} flex scale-0 items-center justify-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100`}
        >
          <ButtonLabelBuilder label={subLabel} icon={subIcon} />
        </div>
      </button>
    ),
    [label, icon, subIcon, subLabel, scroll],
  )

  console.log('render!')

  return <Button _isDiv={true} {...passedProps} label={computedContent} />
}
