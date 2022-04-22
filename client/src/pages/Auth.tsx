import { Outlet } from 'react-router-dom'
import { Section } from '@/ui/Section'

export const Auth = () => {
  return (
    <Section>
      <div className='flex flex-col space-y-4 p-1'>
        <Outlet />
      </div>
    </Section>
  )
}
