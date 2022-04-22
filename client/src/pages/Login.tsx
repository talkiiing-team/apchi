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
        <h2 className='text-center font-sans text-3xl font-light'>Привет!</h2>
        <h4 className='text-center font-sans text-xl font-light'>
          Нужно войти, чтобы продолжить
        </h4>
        <span
          className='media-hover:hover:text-blue-600 cursor-pointer select-none font-sans text-blue-500'
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
          icon={<LoginIcon className='h-5 w-5 stroke-1 text-white' />}
          subIcon={<ArrowRightIcon className='h-5 w-5 stroke-1 text-white' />}
          className='!mt-6 rounded-xl'
          scroll='right'
        />
      </form>
      {errors.password?.message ? (
        <span className='w-full text-center text-rose-400'>
          Неправильный пароль, попробуйте еще раз
        </span>
      ) : null}
    </>
  )
}
