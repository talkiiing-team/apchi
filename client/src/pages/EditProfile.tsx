import { TextArea } from '@/ui/TextArea'
import { InputSpaced } from '@/ui/InputSpaced'
import { Button } from '@/ui/Button'
import { CheckIcon, RefreshIcon } from '@heroicons/react/outline'
import { Select } from '@/ui/Select'
import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
import { LoaderCircle } from '@/ui/LoaderCircle'

export const EditProfile = () => {
  const [loading, setLoading] = useState<boolean>(false)
  /*
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    getValues,
    setError,
  } = useForm<Profile, string>({
    defaultValues: {
      ...defaultProfile,
      ...profile,
    },
  })

  useEffect(() => {
    console.log(profile)
  }, [profile])


  const onSubmit = useCallback(
    (data: Profile) => {
      setLoading(true)
      console.log(data)
      update(data).then(() => {
        setUpdateSucceed(SuccessStatus.Success)
        setLoading(false)
      })
    },
    [update],
  )
*/
  return (
    <div className='flex flex-col space-y-4 p-2 pt-8 pb-[5rem]'>
      <h2 className='text-2xl w-full text-center text-gray-700 font-fancy'>
        Ваша анкета
      </h2>
      <form
        className='flex flex-col space-y-2'
        onSubmit={() => {} /*handleSubmit(onSubmit)*/}
      >
        <InputSpaced label='Ваше имя' id='name' required={true} />
        <InputSpaced label='Возраст' id='age' type={'number'} />
        <InputSpaced label='Рост' id='height' type={'number'} />
        <Select label='Пол' id='sex' options={[]} />
        <Select label='Что вы ищете?' id='lookingFor' options={[]} />
        <TextArea label={`Расскажите о себе`} rows={8} id='desc' />
        <Button
          label={'Сохранить'}
          icon={<CheckIcon className='w-5 h-5 text-white stroke-1' />}
          className='!mt-5'
        />
      </form>
    </div>
  )
}

/*
name: string =
  age: number=
  desc: string =
  active: boolean
  photos: string[]
  relationStatus?: RelationStatus | null =
  smoking?: Frequency | null =
  drinking?: Frequency | null =
  zodiac?: Zodiac | null =
  sociality?: Sociality | null
  height?: number | null =
  lookingFor: LookingFor
 */
