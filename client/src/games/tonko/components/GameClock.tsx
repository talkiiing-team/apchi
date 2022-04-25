import { withApp } from '@/hoc/withApp'
import { useRecoilState } from 'recoil'
import { timeStore } from '@/games/tonko/store/tonko.store'
import { useEffect, useMemo, useState } from 'react'
import { TonkoGameEvent } from '@apchi/games'
import { DateTime } from 'luxon'

export const GameClock = withApp(({ app }) => {
  const [time, setTime] = useRecoilState(timeStore)
  const [currentTime, setCurrentTime] = useState<number>(0)

  useEffect(() => {
    const offTimeListener = app.on<TonkoGameEvent>(
      '@game/timeLeft',
      ({ time }: { time: number }) => {
        console.log('new time', time)
        const targetTimeStamp = DateTime.now()
          .plus({ second: time })
          .toSeconds()
        setTime({ timeStamp: targetTimeStamp, left: time })
      },
    )
    return () => {
      offTimeListener()
    }
  }, [])

  useEffect(() => {
    if (time?.timeStamp) {
      setCurrentTime(time.left)
      const interval = setInterval(
        () =>
          setCurrentTime(time =>
            time
              ? time - 1
              : (() => {
                  clearInterval(interval)
                  return time
                })(),
          ),
        1000,
      )
      return () => {
        clearInterval(interval)
      }
    }
  }, [time?.timeStamp])

  const timeIsUp = useMemo(() => currentTime < 15, [currentTime])

  return (
    <span
      className={`font-mono ${
        timeIsUp ? 'animate-pulse text-pink-600' : 'text-violet-600 '
      }`}
    >
      {currentTime
        ? DateTime.fromSeconds(currentTime).toFormat('mm:ss')
        : '**:**'}
    </span>
  )
})
