import { useRecoilState } from 'recoil'
import { gameStateStore } from '@/games/tonko/store/tonko.store'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Joke, jokePlaceholder } from '@apchi/games'
import { Input } from '@vkontakte/vkui'
import { Button } from '@/ui/Button'
import { withApp } from '@/hoc/withApp'
import { Room } from '@apchi/shared'
import { ReplyIcon } from '@heroicons/react/outline'
import { prepareJokeText } from '@/games/tonko/utils/prepareJokeText'
import { countJokes } from '@/games/tonko/utils/countJokes'

const JokeView = memo(
  ({
    text,
    answerFn,
  }: {
    text: Joke['jokeDraft']
    answerFn: (answers: string[]) => void
  }) => {
    const [inputCount, setInputCount] = useState(0)
    const [answers, setAnswers] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setInputCount(countJokes(text))
      setAnswers([])
    }, [text])

    const preparedText = useMemo(
      () => prepareJokeText(text, answers),
      [text, answers],
    )

    const answersCount = useMemo(() => answers.length, [answers])

    const readyToSend = useMemo(
      () => answersCount === inputCount,
      [answersCount, inputCount],
    )

    const commitAnswerToList = useCallback(() => {
      if (inputRef.current) {
        const value = inputRef.current.value.slice(0, 40)
        setAnswers(ans => [...ans, value || ''])
        inputRef.current.value = ''
      }
    }, [inputRef])

    const dropLastAnswer = useCallback(() => {
      setAnswers(ans => (ans.length ? ans.slice(0, -1) : []))
    }, [])

    const answerCallback = useCallback(() => {
      answerFn(answers)
    }, [answers])

    const submitKey = useCallback(
      e => {
        if (e.key === 'Enter') {
          commitAnswerToList()
        }
      },
      [commitAnswerToList],
    )

    return (
      <div className='flex h-full w-full flex-col'>
        <div className='flex w-full grow flex-col items-center justify-center space-y-3 p-3'>
          <p className='mb-4 w-full whitespace-pre-line text-center'>
            {preparedText}
          </p>
          {!readyToSend && (
            <Input
              placeholder='Заполните пропуск'
              getRef={inputRef}
              className='w-full'
              maxLength={40}
              onKeyDown={submitKey}
            />
          )}
          <div className='flex w-full items-center space-x-2'>
            {answersCount ? (
              <Button
                icon={<ReplyIcon className='h-5 w-5 stroke-1 text-white' />}
                className='w-full'
                variant='error'
                square
                onClick={dropLastAnswer}
              />
            ) : null}
            {readyToSend ? (
              <Button
                label={'Отправить'}
                className='w-full'
                onClick={answerCallback}
              />
            ) : (
              <Button
                label={'Ответить'}
                className='w-full'
                onClick={commitAnswerToList}
              />
            )}
          </div>
        </div>
        <span className='w-full text-center text-xs text-zinc-500'>
          Попробуйте написать вместо пропуска что-нибудь уморительное
        </span>
      </div>
    )
  },
)

export const Punching = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const [gameState, setGameState] = useRecoilState(gameStateStore)
  const [currentJoke, setCurrentJoke] = useState<Joke>()
  const [allAnsweredState, setAllAnsweredState] = useState<boolean>(false)

  const selectJoke = useCallback(() => {
    if (gameState?.jokes) {
      console.log('looking for next joke')
      const nextJoke = gameState.jokes.find(j => j.answers === undefined)
      if (nextJoke) {
        setCurrentJoke(nextJoke)
      } else {
        setAllAnsweredState(true)
      }
    }
  }, [gameState?.jokes])

  useEffect(() => {
    selectJoke()
  }, [gameState?.jokes])

  const rawJokes = useMemo(
    () => gameState?.jokes?.map(v => <p>{v.jokeDraft}</p>) || null,
    [gameState?.jokes],
  )

  const answerFn = useCallback(
    (answers: string[]) => {
      if (currentJoke) {
        app
          .service('game')
          .call('do', roomId, 'answerJoke', {
            id: currentJoke.id,
            jokeDraft: currentJoke.jokeDraft,
            answers: answers,
          } as Joke)
          .then(r => {
            console.log(r)
          })
        setGameState(state => ({
          ...state!,
          jokes: state!.jokes?.map(v =>
            v.id === currentJoke?.id
              ? {
                  ...v,
                  answers: answers,
                }
              : v,
          ),
        }))
      }
    },
    [currentJoke, roomId],
  )

  return (
    <div className='flex h-full w-full flex-col items-center justify-center space-y-2'>
      {allAnsweredState ? (
        <div className='animate-pulse text-lg'>
          Пока на этом все, ждём остальных
        </div>
      ) : currentJoke ? (
        <JokeView text={currentJoke.jokeDraft} answerFn={answerFn} />
      ) : null}
    </div>
  )
})
