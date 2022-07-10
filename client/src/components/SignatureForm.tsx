import {
  Button,
  Card,
  FormItem,
  FormLayout,
  ModalCard,
  ModalPage,
  ModalRoot,
  Textarea,
  useAdaptivity,
  usePlatform,
  ViewWidth,
  File,
} from '@vkontakte/vkui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DocumentAddIcon, PhotographIcon } from '@heroicons/react/outline'
import { withApp } from '@/hoc/withApp'
import { Paintable, PaintableRef } from 'paintablejs/react'
import axios from 'axios'
import { avocado } from '@/services/pokepokeCore'
import { ContentType, WallPost } from '@/types'
import { useRecoilValue } from 'recoil'
import { paramsStore } from '@/store/params.store'

export enum SignatureFormType {
  Text = 'text',
  Picture = 'picture',
  Draw = 'draw',
  DrawArea = 'drawArea',
  DrawSubmit = 'drawSubmit',
}

export const SignatureForm = withApp<{
  type: SignatureFormType | null
  setType: (type: SignatureFormType | null) => void
  refetchPosts: CallableFunction
}>(({ app, type, setType, refetchPosts }) => {
  const { viewWidth } = useAdaptivity()
  const params = useRecoilValue(paramsStore)

  const cardRef = useRef<HTMLDivElement>(null)

  const painTableRef = useRef<PaintableRef>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const [drawing, setDrawing] = useState<boolean>(true)
  const [drawingImage, setDrawingImage] = useState<string>('')

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const createSign = useCallback(() => {
    const text = textAreaRef.current?.value || ''
    if (!text.length) return
    app
      .service<WallPost>('wall')
      .call('createPost', {
        author: {
          id: parseInt(params.vk_user_id),
        },
        target: parseInt(params.vk_profile_id),
        content: {
          type: ContentType.Text,
          data: { text: text },
        },
      } as Omit<WallPost, 'id'>)
      .then(r => refetchPosts())
  }, [params])

  console.log(textAreaRef)

  const sendFile = async () => {
    console.log(fileRef.current?.value)
    const data = new FormData()

    if (fileRef.current?.files) {
      const file = fileRef.current?.files.item(0)

      if (file) {
        data.append('file', file)
        const res = await axios.post(avocado.pictureUpload, data).then(v => v)
        console.log(res)
        app
          .service<WallPost>('wall')
          .call('createPost', {
            author: {
              id: parseInt(params.vk_user_id),
            },
            target: parseInt(params.vk_profile_id),
            content: {
              type: ContentType.Picture,
              data: { url: avocado.getSource(res.data.id) },
            },
          } as Omit<WallPost, 'id'>)
          .then(r => refetchPosts())
      }
    }
  }

  const submitSignature = async () => {
    if (drawingImage.length) {
      const res = await axios
        .post(avocado.drawingUpload, { raw: drawingImage })
        .then(v => v)
      console.log(res)
      app
        .service<WallPost>('wall')
        .call('createPost', {
          author: {
            id: parseInt(params.vk_user_id),
          },
          target: parseInt(params.vk_profile_id),
          content: {
            type: ContentType.Picture,
            data: { url: avocado.getSource(res.data.id) },
          },
        } as Omit<WallPost, 'id'>)
        .then(r => refetchPosts())
    }
  }

  return (
    <ModalRoot activeModal={type} onClose={() => setType(null)}>
      <ModalCard
        id={SignatureFormType.Text}
        onClose={() => setType(null)}
        header='Пожелание'
        actions={
          <Button
            size='l'
            mode='primary'
            onClick={() => {
              createSign()
              setType(null)
            }}
          >
            Приложить текст
          </Button>
        }
      >
        <Textarea placeholder='Оставьте здесь пожелание' getRef={textAreaRef} />
      </ModalCard>

      <ModalCard
        id={SignatureFormType.Picture}
        onClose={() => setType(null)}
        icon={<PhotographIcon className='h-24 w-24 stroke-1 text-current' />}
        header='Прикрепите фото'
        actions={[
          <Button key='continue' size='l' mode='primary' onClick={sendFile}>
            Продолжить
          </Button>,
        ]}
      >
        <div className='flex w-full justify-center'>
          <FormLayout>
            <FormItem>
              <File
                getRef={fileRef}
                size='m'
                mode='secondary'
                before={
                  <DocumentAddIcon className='h-5 w-5 stroke-2 text-current' />
                }
              />
            </FormItem>
          </FormLayout>
        </div>
      </ModalCard>

      <ModalCard
        id={SignatureFormType.Draw}
        header='Оставьте подпись'
        subheader='Это новый способ сделать человеку приятно, отметившись на его стене'
        actions={[
          <Button
            key='go'
            size='l'
            mode='primary'
            onClick={() => setType(SignatureFormType.DrawArea)}
          >
            Попробовать
          </Button>,
          <Button
            key='cancel'
            size='l'
            mode='secondary'
            onClick={() => setType(null)}
          >
            В другой раз
          </Button>,
        ]}
        actionsLayout='vertical'
      />

      <ModalCard
        id={SignatureFormType.DrawArea}
        onClose={() => setType(null)}
        header='Нарисуйте что-нибудь'
        actions={[
          <Button
            key='clear'
            size='l'
            mode='secondary'
            onClick={() => {
              painTableRef.current?.clear()
              setDrawing(true)
            }}
          >
            Сбросить
          </Button>,
          <Button
            key='done'
            size='l'
            mode='primary'
            onClick={() => {
              setDrawing(false)
              setType(SignatureFormType.DrawSubmit)
            }}
          >
            Готово
          </Button>,
        ]}
        actionsLayout='vertical'
      >
        <Card className='mt-2'>
          <div
            className='flex h-full w-full flex-col items-center'
            ref={cardRef}
            onMouseMove={e => e.stopPropagation()}
          >
            <Paintable
              width={400}
              height={300}
              active={drawing}
              color={'#000000'}
              thickness={3}
              useEraser={false}
              ref={painTableRef}
              image={localStorage.getItem('signature') || undefined}
              onSave={(image: string) => {
                console.log('saving', image)
                setDrawingImage(image)
                localStorage.setItem('signature', image)
              }}
              onLongPress={() => console.log('long')}
            />
          </div>
        </Card>
      </ModalCard>

      <ModalCard
        id={SignatureFormType.DrawSubmit}
        onClose={() => setType(null)}
        header='Отправим?'
        actions={[
          <Button
            key='clear'
            size='l'
            mode='secondary'
            onClick={() => {
              setDrawing(true)
              setType(SignatureFormType.DrawArea)
            }}
          >
            Назад
          </Button>,
          <Button key='done' size='l' mode='primary' onClick={submitSignature}>
            Подтвердить
          </Button>,
        ]}
        actionsLayout='vertical'
      >
        <Card className='mt-2'>
          <div
            className='flex h-full w-full flex-col items-center'
            ref={cardRef}
            onMouseMove={e => e.stopPropagation()}
          >
            <img src={drawingImage} />
          </div>
        </Card>
      </ModalCard>
    </ModalRoot>
  )
})
