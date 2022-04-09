import React, { FC, useMemo } from 'react'
import cn from 'classnames'

export interface SelectOption {
  id: string | number
  value: string
}

export const Select: FC<
  React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > & { label?: string; options: SelectOption[] }
> = ({ label, options, ...props }) => {
  const opts = useMemo(
    () =>
      options.map(v => (
        <option key={v.id} value={v.id}>
          {v.value}
        </option>
      )),
    [options],
  )

  return (
    <div className='relative pt-6'>
      <select
        {...props}
        className={`py-3 peer w-full font-sans appearance-none text-sm text-zinc-800 rounded-lg ring-1 ring-zinc-100 bg-zinc-50 px-4 transition-shadow transition-colors duration-150 placeholder:invisible hover:bg-white focus:bg-white focus:ring-violet-400 focus:outline-none [scrollbar-width:none] `}
        placeholder={`${label || 'Input'}`}
      >
        {opts}
      </select>
      {label ? (
        <label className='pointer-events-none h-6 font-sans absolute top-0.5 left-2 text-zinc-500 select-none text-xs transition-all duration-100 peer-placeholder-shown:text-zinc-500 peer-focus:text-violet-400 '>
          {label}
        </label>
      ) : null}
    </div>
  )
}
