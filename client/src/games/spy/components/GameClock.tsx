import { withApp } from '@/hoc/withApp'
import { useRecoilState } from 'recoil'
import { timeStore } from '@/games/spy/store/spy.store'
import { useEffect, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import bridge from '@vkontakte/vk-bridge'
import { SpyGameEvent } from '@apchi/games/src/spy'

export const GameClock = withApp(({ app }) => {
  const [time, setTime] = useRecoilState(timeStore)
  const [currentTime, setCurrentTime] = useState<number>(0)

  useEffect(() => {
    const offTimeListener = app.on<SpyGameEvent>(
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

  const timeIsUp = useMemo(() => {
    if (currentTime < 15) {
      bridge.send('VKWebAppFlashSetLevel', { level: 1 })
      setTimeout(() => bridge.send('VKWebAppFlashSetLevel', { level: 0 }), 500)
    }
    return currentTime < 15
  }, [currentTime])

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
