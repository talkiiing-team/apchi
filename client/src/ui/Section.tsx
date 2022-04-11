import { FC } from 'react'

export const Section: FC = ({ children, ...props }) => {
  return (
    <div
      className='rounded-2xl ring-1 ring-zinc-50 w-full bg-white flex flex-col p-3 shadow-xl'
      {...props}
    >
      {children}
    </div>
  )
}
