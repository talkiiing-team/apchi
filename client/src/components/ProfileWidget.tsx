import { Section } from '@/ui/Section'
import { withApp } from '@/hoc/withApp'
import { useAuth } from '@/hooks/useAuth'
import { useRecoilState, useRecoilValue } from 'recoil'
import { paramsStore } from '@/store/params.store'
import { Avatar, Button, Headline, SimpleCell, Subhead } from '@vkontakte/vkui'
import { profileStore } from '@/store/profile.store'
import bridge from '@vkontakte/vk-bridge'
import { useCallback } from 'react'
import { wallCountSelector } from '@/store/cache.store'

export const ProfileWidget = withApp(({ app }) => {
  const {
    user: { id: userId },
  } = useAuth()
  const [params, setParams] = useRecoilState(paramsStore)
  const profile = useRecoilValue(profileStore)
  const postCount = useRecoilValue(wallCountSelector)
  const isOwner = params.vk_profile_id === params.vk_user_id

  const deleteProfileButton = useCallback(() => {
    bridge.send('VKWebAppRemoveFromProfile').then(() => {
      setParams(params => ({ ...params, vk_has_profile_button: false }))
    })
  }, [])

  return (
    <Section>
      <div className='flex w-full flex-col items-center space-y-2 p-2'>
        <Avatar size={72} src={profile.photo_100} className='mb-2' />
        <Headline weight='semibold'>
          {profile.first_name} {profile.last_name}
        </Headline>
        <Subhead className='text-zinc-600' weight='regular'>
          Автографов: {postCount}
        </Subhead>
        {isOwner && params.vk_has_profile_button ? (
          <Button
            mode='tertiary'
            appearance='negative'
            onClick={deleteProfileButton}
            className='!mt-4'
          >
            Удалить кнопку из профиля
          </Button>
        ) : null}
      </div>
    </Section>
  )
})
