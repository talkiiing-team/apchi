import { SlideButton } from '@/ui/SlideButton'
import { ArrowRightIcon, LoginIcon } from '@heroicons/react/outline'
import { useNavigate, Outlet } from 'react-router-dom'
import { Input } from '@/ui/Input'
import { useForm } from 'react-hook-form'
import { User } from '@/types'
import { useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const Register = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    getValues,
    setError,
  } = useForm<Pick<User, 'email' | 'password'>, string>({
    shouldUnregister: true,
    reValidateMode: 'onChange',
  })

  const { register: createUser, login } = useAuth()

  const onSubmit = useCallback(
    (data: Pick<User, 'email' | 'password'>) =>
      createUser(data)
        .then(() => login(data))
        .then((r: any) => {
          console.log(r)
          navigate('/')
        })
        .catch((e: any) => {
          console.log(e)
          setError('email', { message: 'Неправильный адрес' })
          reset(undefined, { keepValues: true })
        }),
    [],
  )

  return (
    <>
      <div className='flex flex-col items-center space-y-2 p-2'>
        <h2 className='font-fancy text-3xl'>Привет!</h2>
        <h4 className='font-fancy text-xl'>Давай знакомиться!</h4>
        <span
          className='font-sans text-blue-500 media-hover:hover:text-blue-600 cursor-pointer select-none'
          onClick={() => navigate('/auth')}
        >
          У меня есть аккаунт
        </span>
      </div>
      <form
        className='flex flex-col space-y-2'
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          defaultValue={getValues().email}
          onChange={e => setValue('email', e.currentTarget.value)}
          label='E-mail'
          className='!rounded-xl'
        />
        <Input
          defaultValue={getValues().password}
          onChange={e => setValue('password', e.currentTarget.value)}
          type={'password'}
          label='Пароль'
          className='!rounded-xl'
        />
        <SlideButton
          label='Зарегистрироваться'
          icon={<LoginIcon className='w-5 h-5 text-white stroke-1' />}
          subIcon={<ArrowRightIcon className='w-5 h-5 text-white stroke-1' />}
          className='rounded-xl !mt-6'
        />
      </form>
      {errors.email?.message ? (
        <span className='text-rose-400 w-full text-center'>
          Произошла ошибочка, проверьте Ваш пароль, он должен быть надежным, а
          почта - только Вашей
        </span>
      ) : null}
    </>
  )
}
