import { ProfileWidget } from '@/components/ProfileWidget'
import { useRecoilState } from 'recoil'
import {
  CursorClickIcon,
  PencilIcon,
  ViewGridAddIcon,
} from '@heroicons/react/outline'
import { SlideButton } from '@/ui/SlideButton'
import { Wall } from '@/components/Wall'
import { paramsStore } from '@/store/params.store'
import { Section } from '@/ui/Section'
import { ActionSheet, ActionSheetItem, Headline } from '@vkontakte/vkui'
import bridge from '@vkontakte/vk-bridge'
import { useCallback, useRef, useState } from 'react'
import { withApp } from '@/hoc/withApp'
import { ContentType, WallPost } from '@/types'
import { wallStore } from '@/store/cache.store'
import { SignatureForm, SignatureFormType } from '@/components/SignatureForm'

export const Investigate = withApp(({ app }) => {
  const [params, setParams] = useRecoilState(paramsStore)
  const [wall, setWall] = useRecoilState(wallStore)
  const menuRef = useRef(null)
  const isOwner = params.vk_profile_id === params.vk_user_id
  const addProfileButton = useCallback(() => {
    bridge.send('VKWebAppAddToProfile', { ttl: 0 }).then(() => {
      setParams(params => ({ ...params, vk_has_profile_button: 'true' }))
    })
  }, [])

  const refetchPosts = useCallback(
    () =>
      app
        .service('wall')
        .call('list', parseInt(params.vk_profile_id))
        .then(r => setWall(r)),
    [params.vk_profile_id],
  )

  const [showSelect, setShowSelect] = useState<boolean>(false)

  const [activeType, setActiveType] = useState<SignatureFormType | null>(null)

  return (
    <div className='flex h-full w-full flex-col items-center justify-start space-y-3'>
      {!params.vk_has_profile_button ? (
        <Section>
          <div className='flex flex-col items-center space-y-4'>
            <Headline weight='regular' className='text-center'>
              У вас еще нет нашей кнопочки!
            </Headline>
            <SlideButton
              label='Установить на страницу'
              icon={<ViewGridAddIcon className='h-5 w-5 text-white' />}
              subLabel='Тык!'
              subIcon={<CursorClickIcon className='h-5 w-5 text-white' />}
              className='w-full'
              onClick={addProfileButton}
            />
          </div>
        </Section>
      ) : null}
      <ProfileWidget />
      {!params.vk_profile_button_forbidden ? (
        <SlideButton
          label={!isOwner ? 'Оставить подпись' : 'Расписать себе стену'}
          icon={<PencilIcon className='h-5 w-5 text-white' />}
          subLabel='Тык!'
          subIcon={<CursorClickIcon className='h-5 w-5 text-white' />}
          className='w-full'
          onClick={() => setShowSelect(true)}
        />
      ) : (
        <span className='my-3 text-rose-500'>
          Вам не разрешено оставлять подписи здесь
        </span>
      )}
      <Wall fetchPosts={refetchPosts} />
      {showSelect ? (
        <ActionSheet
          onClose={() => setShowSelect(false)}
          iosCloseItem={
            <ActionSheetItem autoclose mode='cancel'>
              Отменить
            </ActionSheetItem>
          }
          toggleRef={menuRef}
        >
          <ActionSheetItem
            autoclose
            onClick={() => setActiveType(SignatureFormType.Text)}
          >
            Написать записку
          </ActionSheetItem>
          <ActionSheetItem
            autoclose
            onClick={() => setActiveType(SignatureFormType.Picture)}
          >
            Прикрепить фото
          </ActionSheetItem>
          <ActionSheetItem
            autoclose
            onClick={() => setActiveType(SignatureFormType.Draw)}
          >
            Расписаться
          </ActionSheetItem>
        </ActionSheet>
      ) : null}
      <SignatureForm
        type={activeType}
        setType={type => setActiveType(type)}
        refetchPosts={refetchPosts}
      />
    </div>
  )
})
