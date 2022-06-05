import { useEffect, useState } from 'react'
import { User } from '@apchi/shared'
import { useRecoilState } from 'recoil'
import { userStore } from '@/games/spy/store/spy.store'
import { SpyGameEvent } from '@apchi/games/src/spy'
import { withApp } from '@/hoc/withApp'

export const VotesWidget = withApp(({ app }) => {
  const [suspectMap, setSuspectMap] =
    useState<Record<User['userId'], User['userId']>>()
  const [userMap, setUserMap] = useRecoilState(userStore)

  useEffect(() => {
    const offVoteAccepted = app.on<SpyGameEvent>(
      '@game/voteAccepted',
      ({ suspect, issuer }: { suspect: User; issuer: User }) => {
        console.log('new vote', suspect, issuer)
        let patch = {}
        if (!userMap[suspect.userId]) {
          Object.assign(patch, { [suspect.userId]: suspect })
        }
        if (!userMap[issuer.userId]) {
          Object.assign(patch, { [issuer.userId]: issuer })
        }
        if (Object.keys(patch).length) {
          setUserMap(map => ({ ...map, ...patch }))
        }
        setSuspectMap(map => ({ ...map, [issuer.userId]: suspect.userId }))
      },
    )
    return () => {
      offVoteAccepted()
    }
  }, [])

  return <>{JSON.stringify(suspectMap)}</>
})
