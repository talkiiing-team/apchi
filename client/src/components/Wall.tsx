import { withApp } from '@/hoc/withApp'
import { Section } from '@/ui/Section'
import { useRecoilState, useRecoilValue } from 'recoil'
import { userGarbageStore, wallStore } from '@/store/cache.store'
import { useEffect, useMemo, useState } from 'react'
import { paramsStore } from '@/store/params.store'
import {
  Avatar,
  Button,
  ButtonGroup,
  Headline,
  ModalCard,
  ModalRoot,
  RichCell,
} from '@vkontakte/vkui'
import bridge from '@vkontakte/vk-bridge'
import { accessTokenStore } from '@/store/auth.store'
import { ContentType, WallPost } from '@/types'
import { ShareIcon } from '@heroicons/react/outline'

enum ViewType {
  Text = 'text',
  Picture = 'picture',
}

const getStickerLink = (post: WallPost): string => {
  if (post.content.type === ContentType.Text) {
    return `https://textoverimage.moesif.com/image?image_url=https%3A%2F%2Fsun9-east.userapi.com%2Fsun9-27%2Fs%2Fv1%2Fig2%2FnAVJhbUGhk5rt84OW1bNNQCGg8sBbHaQYz21x0PRTCmZq0CexnmgBFpb4WVhez5eJAAp7MeIF12C3Cnw0fqyZtLS.jpg%3Fsize%3D600x600%26quality%3D95%26type%3Dalbum&overlay_color=312e2e47&text=${encodeURI(
      (post as WallPost<ContentType.Text>).content.data.text,
    )}&text_size=32&y_align=middle&x_align=center`
  } else if (post.content.type === ContentType.Picture) {
    return (post as WallPost<ContentType.Picture>).content.data.url
  } else {
    return ''
  }
}

export const Wall = withApp<{ fetchPosts: () => Promise<void> }>(
  ({ app, fetchPosts }) => {
    const [wall, setWall] = useRecoilState(wallStore)
    const accessToken = useRecoilValue(accessTokenStore)
    const [loading, setLoading] = useState<boolean>(false)
    const [params, setParams] = useRecoilState(paramsStore)
    const [cache, setCache] = useRecoilState(userGarbageStore)
    const [viewType, setViewType] = useState<boolean>(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [signature, setSignature] = useState<WallPost | null>()

    useEffect(() => {
      setLoading(true)
      fetchPosts().then(() => {
        setLoading(false)
      })
      return () => {
        setWall([])
      }
    }, [params.vk_profile_id])

    useEffect(() => {
      const usersToFetch = new Set(
        wall.filter(post => !cache[post.author.id]).map(post => post.author.id),
      )
      console.log(usersToFetch)
      if (usersToFetch.size) {
        bridge.send('VKWebAppCallAPIMethod', {
          method: 'users.get',
          request_id: 'getGarbage',
          params: {
            user_ids: [...usersToFetch.values()].join(','),
            v: '5.101',
            access_token: accessToken,
            fields: 'photo_100',
          },
        })
      }
    }, [wall, cache])

    const computedWall = useMemo(() => {
      return wall.length ? (
        wall.map(post => (
          <RichCell
            key={post.id}
            disabled
            multiline
            before={
              <Avatar
                size={72}
                src={
                  cache[post.author.id]?.photo_100 ||
                  'https://vk.com/images/camera_100.png'
                }
              />
            }
            after={post.content.type === ContentType.Text ? 'Текст' : 'Рисунок'}
            actions={
              <ButtonGroup mode='horizontal' gap='s' stretched>
                <Button
                  mode='primary'
                  size='s'
                  onClick={() => {
                    setSelectedId(post.id)
                    setViewType(true)
                  }}
                >
                  Просмотреть
                </Button>
                <Button
                  mode='secondary'
                  size='s'
                  onClick={() => {
                    bridge.send('VKWebAppShowStoryBox', {
                      background_type: 'image',
                      url: 'https://sun9-65.userapi.com/c850136/v850136098/1b77eb/0YK6suXkY24.jpg',
                      stickers: [
                        {
                          sticker_type: 'renderable',
                          sticker: {
                            content_type: 'image',
                            url: getStickerLink(post),
                          },
                        },
                      ],
                    })
                  }}
                >
                  <ShareIcon className='h-4 w-4 text-current' />
                </Button>
              </ButtonGroup>
            }
          >
            {cache[post.author.id]
              ? `${cache[post.author.id].first_name} ${
                  cache[post.author.id].last_name
                }`
              : 'Загрузка автора...'}
          </RichCell>
        ))
      ) : (
        <div className='flex h-40 w-full items-center justify-center'>
          <Headline weight='regular' className='text-zinc-500'>
            Тут пока пусто(
          </Headline>
        </div>
      )
    }, [wall, cache])

    useEffect(() => {
      console.log(selectedId)
      if (selectedId !== null) {
        app
          .service<WallPost>('wall')
          .get(selectedId!)
          .then(r => {
            setSignature(r)
            setViewType(true)
          })
      }
      return () => {
        setViewType(false)
      }
    }, [selectedId])

    return (
      <>
        <Section title='Моя стена'>
          <div className='flex flex-col space-y-3'>{computedWall}</div>
        </Section>
        <ModalRoot
          activeModal={viewType ? 'show' : null}
          onClose={() => setViewType(false)}
        >
          <ModalCard
            id={'show'}
            onClose={() => setViewType(false)}
            header='Автограф'
            actions={
              <Button
                size='l'
                mode='secondary'
                onClick={() => setViewType(false)}
              >
                Закрыть
              </Button>
            }
          >
            <div className='mt-2'>
              <img
                src={
                  (signature as WallPost<ContentType.Picture>)?.content.data
                    ?.url
                }
              />
              {(signature as WallPost<ContentType.Text>)?.content.data?.text}
            </div>
          </ModalCard>
        </ModalRoot>
      </>
    )
  },
)
