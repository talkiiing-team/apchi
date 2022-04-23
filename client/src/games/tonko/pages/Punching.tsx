import { useRecoilState } from 'recoil'
import { gameStateStore } from '@/games/tonko/store/tonko.store'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Joke, jokePlaceholder } from '@apchi/games'
import { Input } from '@vkontakte/vkui'
import { Button } from '@/ui/Button'
import { withApp } from '@/hoc/withApp'
import { Room } from '@apchi/shared'

const prepareJokeText = (
  text: Joke['jokeDraft'],
  answers: string[],
): string => {
  console.log('preparing text')
  let i = 0
  return text.replaceAll(jokePlaceholder, () => {
    return answers[i++] || '______'
  })
}

const countJokes = (base: string) =>
  (base.match(new RegExp(jokePlaceholder, 'g')) || []).length

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
        const value = inputRef.current.value
        setAnswers(ans => [...ans, value || 'Error'])
        inputRef.current.value = ''
      }
    }, [inputRef])

    const answerCallback = useCallback(() => {
      answerFn(answers)
    }, [answers])

    return (
      <div className='flex flex-col items-start space-y-1'>
        <span>{preparedText}</span>
        {readyToSend ? (
          <Button label={'Отправить'} onClick={answerCallback} />
        ) : (
          <>
            <Input
              placeholder='Добивочка'
              onChange={e => console.log(e.target.value)}
              getRef={inputRef}
            />
            <Button label={'Ответить'} onClick={commitAnswerToList} />
          </>
        )}
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
    <div>
      {allAnsweredState ? (
        <div>That's all for now</div>
      ) : (
        <div>
          {currentJoke ? (
            <JokeView text={currentJoke.jokeDraft} answerFn={answerFn} />
          ) : null}
        </div>
      )}
    </div>
  )
})
