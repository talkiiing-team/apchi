import { useNavigate, Outlet } from 'react-router-dom'

export const Auth = () => {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col space-y-4 p-2'>
      <Outlet />
    </div>
  )
}
