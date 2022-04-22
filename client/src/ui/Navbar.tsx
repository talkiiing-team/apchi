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
      className='flex h-full w-20 cursor-pointer flex-col items-center justify-center space-y-0.5 px-1 py-1'
      onClick={() => {
        navigate(link)
      }}
    >
      <Icon
        className={`h-8 w-8 stroke-1 transition-transform will-change-transform  ${
          active ? 'text-violet-500' : 'scale-90 text-violet-400'
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
    <div className='shadow-up fixed bottom-0 left-0 w-full bg-white px-1 pb-[env(safe-area-inset-bottom)]'>
      <div className='mx-auto flex h-[4rem] max-w-[450px] items-center justify-around'>
        {options.map(v => (
          <Option key={v.badgeKey} {...v} active={section === v.link} />
        ))}
      </div>
    </div>
  )
}
