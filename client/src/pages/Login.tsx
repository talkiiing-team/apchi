import { SlideButton } from '@/ui/SlideButton'
import { ArrowRightIcon, LoginIcon } from '@heroicons/react/outline'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Credentials } from '@/types'
import { useCallback } from 'react'
import { Input } from '@/ui/Input'
import { useAuth } from '@/hooks/useAuth'

type FormTypes = Pick<Credentials, 'password'>

export const Login = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    getValues,
    setError,
  } = useForm<FormTypes, string>({
    shouldUnregister: true,
    reValidateMode: 'onChange',
  })

  const { login } = useAuth()

  const onSubmit = useCallback(
    (data: FormTypes) =>
      login(data)
        .then(r => {
          console.log(r)
          navigate('/')
        })
        .catch(e => {
          console.log(e)
          setError('password', { message: '' })
          reset(undefined, { keepValues: true })
        }),
    [],
  )

  return (
    <>
      <div className='flex flex-col items-center space-y-2 p-2'>
        <h2 className='font-fancy text-3xl text-center'>Привет!</h2>
        <h4 className='font-fancy text-xl text-center'>
          Нужно войти, чтобы продолжить
        </h4>
        <span
          className='font-sans text-blue-500 media-hover:hover:text-blue-600 cursor-pointer select-none'
          onClick={() => navigate('register')}
        >
          Я еще не зарегистрирован
        </span>
      </div>
      <form
        className='flex flex-col space-y-2'
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          defaultValue={getValues().password}
          onChange={e => setValue('password', e.currentTarget.value)}
          type={'password'}
          label='Пароль'
          className='!rounded-xl'
        />
        <SlideButton
          onClick={handleSubmit(onSubmit)}
          label='Войти'
          icon={<LoginIcon className='w-5 h-5 text-white stroke-1' />}
          subIcon={<ArrowRightIcon className='w-5 h-5 text-white stroke-1' />}
          className='rounded-xl !mt-6'
        />
      </form>
      {errors.password?.message ? (
        <span className='text-rose-400 w-full text-center'>
          Неправильный пароль, попробуйте еще раз
        </span>
      ) : null}
    </>
  )
}
