import { ProfileImage } from '@/components/inProfile/ProfileImage'
import { Button } from '@/ui/Button'
import { SlideButton } from '@/ui/SlideButton'
import { LogoutIcon, PencilIcon } from '@heroicons/react/outline'
import { getRandomAge, getRandomName } from '@/utils/randomData'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { needSetupProfileStore } from '@/store/profile.store'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'

export const MyProfile = () => {
  const navigate = useNavigate()
  const needSetupProfile = useRecoilValue(needSetupProfileStore)
  const { profile } = useProfile()
  const { logout } = useAuth()

  return (
    <div className='h-full flex flex-col space-y-4 p-2 pt-10 justify-between'>
      <div className='flex flex-col items-center space-y-4 p-2'>
        {needSetupProfile ? (
          <>
            <ProfileImage source={''} className='w-1/2' />
            <h2 className='font-fancy text-2xl'>Давай знакомиться</h2>
          </>
        ) : (
          <>
            <ProfileImage source={''} className='w-1/2' />
            <h2 className='font-fancy text-3xl'>{`${profile.name}, ${profile.age}`}</h2>
          </>
        )}
        <SlideButton
          label={needSetupProfile ? 'Создать профиль' : 'Редактировать'}
          subIcon={<PencilIcon className={'w-5 h-5 text-white stroke-1'} />}
          variant={'primary'}
          className={'w-full'}
          onClick={() => navigate('edit')}
        />
      </div>
      <div className='flex flex-col space-y-2'>
        <SlideButton
          label={'Выйти'}
          subIcon={<LogoutIcon className={'w-5 h-5 text-white stroke-1'} />}
          variant={'error'}
          className={'w-full'}
          onClick={() => {
            logout()
            navigate('/auth')
          }}
        />
      </div>
    </div>
  )
}
