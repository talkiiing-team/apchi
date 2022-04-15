import React, {
  DetailedReactHTMLElement,
  FC,
  ForwardedRef,
  forwardRef,
} from 'react'
import cn from 'classnames'

export const Input = forwardRef(
  (
    {
      label,
      className,
      inputClassName,
      ...props
    }: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    > & { label?: string; inputClassName?: string },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className={className}>
        <div className='relative'>
          <input
            {...props}
            ref={ref}
            className={`${cn(
              {
                'pt-5 pb-1.5': !!label,
                'py-3': !label,
              },
              inputClassName,
            )} peer w-full appearance-none text-zinc-800 rounded-xl ring-1 ring-zinc-100 bg-zinc-100 px-4 transition-shadow 
        transition-colors duration-150 placeholder:invisible hover:bg-zinc-50 focus:bg-white focus:ring-violet-400 focus:outline-none`}
            placeholder={`${label || 'Input'}`}
          />
          {label ? (
            <label className='pointer-events-none absolute top-1.5 left-4 select-none text-xs text-zinc-500 transition-all duration-100 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs'>
              {label}
            </label>
          ) : null}
        </div>
      </div>
    )
  },
)
