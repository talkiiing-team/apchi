import { useRecoilState } from 'recoil'
import { gameStateStore } from '@/games/tonko/store/tonko.store'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Actions, Joke, JokeSubmissionData, TonkoGameEvent } from '@apchi/games'
import { withApp } from '@/hoc/withApp'
import { Room } from '@apchi/shared'
import { prepareJokeText } from '@/games/tonko/utils/prepareJokeText'
import { Button } from '@/ui/Button'

const JokeView = memo(
  ({
    text,
    voteFn,
    answers,
  }: {
    text: Joke['jokeDraft']
    voteFn: () => void
    answers: Joke['answers']
  }) => {
    const resultAnswer = useMemo(() => {
      return answers?.map((v, i) => (
        <p key={i} className='w-full  text-center'>
          {v}
        </p>
      ))
    }, [answers])

    return (
      <div className='flex w-full flex-col space-y-2 bg-pink-100 p-2'>
        <div className='mb-4 w-full'>{resultAnswer}</div>
        <Button label={'Лайкусик'} className='w-full' onClick={voteFn} />
      </div>
    )
  },
)

export const Voting = withApp<{ roomId: Room['id'] }>(({ app, roomId }) => {
  const [gameState, setGameState] = useRecoilState(gameStateStore)
  const [jokes, setJokes] = useState<JokeSubmissionData[]>()
  const [jokeText, setJokeText] = useState<Joke['jokeDraft']>('')

  useEffect(() => {
    const offNewVoteReceive = app.on<TonkoGameEvent>(
      '@game/voteForPunch',
      ({
        jokeId,
        submissions,
        jokeDraft,
      }: {
        jokeId: JokeSubmissionData['id']
        submissions: JokeSubmissionData[]
        jokeDraft: Joke['jokeDraft']
      }) => {
        console.log('jokes for voting', jokeId, jokeDraft, submissions)
        setJokes(submissions)
        setJokeText(jokeDraft)
      },
    )
    return () => {
      offNewVoteReceive()
    }
  }, [])

  const originalJoke = useMemo(
    () => prepareJokeText(jokeText || '', []),
    [jokeText],
  )

  const voteFor = useCallback(
    (userId: JokeSubmissionData['userId'], jokeId: JokeSubmissionData['id']) =>
      () =>
        app
          .service('game')
          .call('do', roomId, Actions.VoteForJoke, userId, jokeId)
          .then(r => {
            console.log('voted')
          }),
    [],
  )

  const memoizedChildren = useMemo(
    () =>
      jokes?.map(v => (
        <JokeView
          text={v.joke.jokeDraft}
          answers={v.joke.answers}
          voteFn={voteFor(v.userId, v.id)}
        />
      )),
    [jokes],
  )

  return (
    <div className='flex h-full w-full flex-col items-center justify-items-stretch space-y-2'>
      <div className='flex w-full flex-col'>
        <span className='w-full text-center text-sm'>Оригинал</span>
        <span className='w-full text-center'>{originalJoke}</span>
      </div>
      <div className='flex w-full flex-col space-y-2'>{memoizedChildren}</div>
    </div>
  )
})
