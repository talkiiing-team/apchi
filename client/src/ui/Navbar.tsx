import {
  CollectionIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/outline'
import { SVGProps, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavbarOption {
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
  title: string
  badgeKey: string
  link: string
}

const options: NavbarOption[] = [
  {
    icon: CollectionIcon,
    title: 'Искать',
    link: '/',
    badgeKey: 'explore',
  },
  {
    icon: UsersIcon,
    title: 'Друзья',
    link: '/friends',
    badgeKey: 'friends',
  },
  {
    icon: UserCircleIcon,
    title: 'Я',
    link: '/me',
    badgeKey: 'me',
  },
]

const Option = ({
  icon: Icon,
  title,
  link,
  badgeKey,
  active,
}: NavbarOption & { active?: boolean }) => {
  const navigate = useNavigate()
  return (
    <div
      className='h-full w-20 flex flex-col items-center justify-center space-y-0.5 px-1 py-1 cursor-pointer'
      onClick={() => {
        navigate(link)
      }}
    >
      <Icon
        className={`w-8 h-8 will-change-transform transition-transform stroke-1  ${
          active ? 'text-violet-500' : 'text-violet-400 scale-90'
        }`}
      />
      {/*<span
        className={`text-xs  ${
          active ? 'text-violet-500' : 'text-violet-400'
        } font-sans`}
      >
        {title}
      </span>*/}
    </div>
  )
}

export const Navbar = () => {
  const location = useLocation()

  const section = useMemo(
    () => '/' + location.pathname.split('/')[1],
    [location.pathname],
  )

  const isAuth = useMemo(() => section === '/auth', [section])

  useEffect(() => {
    console.log(section)
  }, [section])

  return isAuth ? null : (
    <div className='fixed bottom-[env(safe-area-inset-bottom)] left-0 w-full h-[4rem] bg-white shadow-up px-1 py-1'>
      <div className='mx-auto h-full max-w-[450px] flex justify-around items-center items-center'>
        {options.map(v => (
          <Option key={v.badgeKey} {...v} active={section === v.link} />
        ))}
      </div>
    </div>
  )
}
