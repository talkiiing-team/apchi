import React, { FC } from 'react'
import cn from 'classnames'

export const InputSpaced: FC<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & { label?: string }
> = ({ label, ...props }) => {
  return (
    <div className='relative pt-6'>
      <input
        {...props}
        className={`py-3 peer w-full font-sans appearance-none text-sm text-zinc-800 rounded-lg ring-1 ring-zinc-100 bg-zinc-50 px-4 transition-shadow transition-colors duration-150 placeholder:invisible hover:bg-white focus:bg-white focus:ring-violet-400 focus:outline-none [scrollbar-width:none] `}
        placeholder={`${label || 'Input'}`}
      />
      {label ? (
        <label className='pointer-events-none h-6 font-sans absolute top-0.5 left-2 text-zinc-500 select-none text-xs transition-all duration-100 peer-placeholder-shown:text-zinc-500 peer-focus:text-violet-400 '>
          {label}
        </label>
      ) : null}
    </div>
  )
}
