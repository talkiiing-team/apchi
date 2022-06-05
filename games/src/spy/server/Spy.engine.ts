import { Engine, EngineUtils } from '../../common/Engine'
import { v4 as uuidv4 } from 'uuid'
import locationsData from '../assets/locations'
import { Crud, Game, User, useSleep, useTable } from '@apchi/shared'
import {
  Actions,
  buildGameEvent,
  isNormal,
  isSpy,
  SpyGameEvent,
  Role,
  Stage,
  UserGameData,
  Location,
} from '../shared'
import { arrayShuffle } from '../../common/utils/arrayShuffle'
import { selectRandom } from '../../common/utils/selectRandom'

const log = (...message: any[]) =>
  console.log(
    `[${new Date().toLocaleTimeString()}]: [\u001b[33mSpy\u001b[0m] ${message.join(
      ' ',
    )}`,
  )

export type SpyState = {
  stage: Stage
  round: number
  userGameStore: Crud<UserGameData, 'userId'>
}

function getAutoRoleSet(length: number) {
  let spyCount = 1
  if (length > 6) spyCount = 2
  if (length > 10) spyCount = 3
  return arrayShuffle(
    Array.from({ length: spyCount }, () => Role.Spy).concat(
      Array.from({ length: length - spyCount }, () => Role.Normal),
    ),
  )
}

export class SpyEngine extends Engine<SpyState> {
  gameId = 'spy'
  static meta: Game = {
    id: 'spy',
    name: 'Spy',
    description: 'Находка для шпиона, только онлайн!',
    requirements: {
      maxUsers: 8,
      minUsers: 3,
    },
  }

  private sleepService = useSleep()
  private useTable = useTable(this.STORAGE)

  private locations: Location[] = []
  private narratorId!: User['userId']
  private roles: Role[] = []
  private normalUsers: User['userId'][] = []
  private currentLocation!: Location
  private starterLocations = locationsData.map(location => location.name)

  protected onGameStart() {
    this.registerUsers()
    this.state.stage = Stage.Launch
    this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
      stage: Stage.Launch,
    })

    setTimeout(() => {
      this.state.stage = Stage.GameSetup
    }, 2000)
  }

  private registerUsers() {
    this.users.forEach(user => {
      this.state.userGameStore?.insert(user.userId, {
        userId: user.userId,
      })
    })
  }
  private suspects: Record<User['userId'], User['userId']> = {}
  private discussionActive: boolean = false
  private endDiscussion?: CallableFunction
  private async startDiscussion(durationMillis: number) {
    return new Promise<void>((res, rej) => {
      this.discussionActive = true
      const timer = setTimeout(() => {
        this.discussionActive = false
        res()
      }, durationMillis)
      this.endDiscussion = () => {
        clearTimeout(timer)
        this.discussionActive = false
        res()
      }
    })
  }

  protected async onStateChange(
    key: keyof SpyState,
    oldValue: any,
    newValue: any,
  ): Promise<void> {
    log(`State updated [${key}] ${oldValue} → ${newValue}`)
    if (key === 'stage') {
      switch (newValue) {
        case Stage.GameSetup: {
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.GameSetup,
          })
          this.state.stage = Stage.Starting
          break
        }
        case Stage.Starting: {
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.Starting,
          })
          this.currentLocation = selectRandom(this.starterLocations)
          this.sendToRoom(buildGameEvent(SpyGameEvent.TimeLeft), {
            time: 5,
          })
          this.sendToRoom(buildGameEvent(SpyGameEvent.UsersPresentation), {
            users: this.users,
          })
          this.tempTimer = setTimeout(() => {
            this.state.stage = Stage.Giveaway
          }, 5 * 1000)
          break
        }
        case Stage.Giveaway: {
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.Giveaway,
          })
          if (!this.roles.length) this.roles = getAutoRoleSet(this.users.length)
          log(JSON.stringify(this.roles))
          this.state.userGameStore!.forEach((user, i) => {
            log('currently on player', i)
            this.state.userGameStore.patch(user.userId, { role: this.roles[i] })
            this.sendToUser(
              user.userId,
              buildGameEvent(SpyGameEvent.ReceiveCard),
              {
                sent: true,
                role: this.roles[i],
                location:
                  this.roles[i] === Role.Normal
                    ? this.currentLocation
                    : undefined,
              },
            )
          })
          this.sendToRoom(buildGameEvent(SpyGameEvent.TimeLeft), {
            time: 15,
          })
          this.tempTimer = setTimeout(() => {
            this.state.stage = Stage.Vote
          }, 15 * 1000)
          break
        }
        case Stage.Vote: {
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.Vote,
          })

          // Send all resulting information

          const roundTime = this.users.length * 60
          this.sendToRoom(buildGameEvent(SpyGameEvent.TimeLeft), {
            time: roundTime,
          })
          await this.startDiscussion(roundTime * 1000)

          await this.sleepService.startSleep(1000)
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.Results,
          })
          this.state.stage = Stage.Results
          break
        }
        case Stage.Results: {
          break
        }
      }
    }
  }

  protected onGameFinish(): void {}

  private tempTimer!: ReturnType<typeof setTimeout>

  public applyAction(user: User, action: Actions, ...args: any[]): any {
    log(`Got action === ${action}`)
    if (action === Actions.Vote) {
      if (this.state.stage !== Stage.Vote)
        throw { reason: 'Right now is not a setup stage', code: 403 }
      const suspect = this.users.find(u => u.userId === args[0])!
      this.sendToRoom(buildGameEvent(SpyGameEvent.VoteAccepted), {
        suspect: suspect,
        issuer: user,
      })
      this.suspects = { ...this.suspects, [user.userId]: suspect.userId }
    }
  }

  constructor(utils: EngineUtils) {
    const initialState: SpyState = {
      stage: Stage.Off,
      round: 0,
    } as SpyState
    super(initialState, { users: [] }, utils)
    this.state.userGameStore = this.useTable('userGameStore', 'userId')
  }
}
