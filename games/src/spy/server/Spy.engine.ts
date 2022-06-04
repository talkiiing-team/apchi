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

const log = (message: string) =>
  console.log(
    `[${new Date().toLocaleTimeString()}]: [\u001b[33mSpy\u001b[0m] ${message}`,
  )

const locationList: Location[] = locationsData.map(location => ({
  ...location,
  id: uuidv4(),
}))

export type SpyState = {
  stage: Stage
  round: number
  currentLocation: Location
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

  protected onGameStart() {
    this.state.stage = Stage.Launch
    this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
      stage: Stage.Launch,
    })

    setTimeout(() => {
      this.state.stage = Stage.GameSetup
    }, 5000)
  }

  private registerUsers() {
    this.users.forEach(user => {
      this.state.userGameStore?.insert(user.userId, {
        userId: user.userId,
      })
    })
  }

  private async discussion() {
    await this.sleepService.startSleep(6000)
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
          this.sendToRoom(buildGameEvent(SpyGameEvent.TimeLeft), {
            time: 5,
          })
          this.registerUsers()
          await this.sleepService.startSleep(5 * 1000)
          this.state.stage = Stage.Starting
          break
        }
        case Stage.Starting: {
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.Starting,
          })
          this.state.currentLocation = selectRandom(locationList)
          this.sendToRoom(buildGameEvent(SpyGameEvent.TimeLeft), {
            time: 5,
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
          if (!this.roles) this.roles = getAutoRoleSet(this.users.length)
          this.state.userGameStore!.forEach((user, i) => {
            this.sendToUser(
              user.userId,
              buildGameEvent(SpyGameEvent.ReceiveCard),
              { role: this.roles[i] },
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

          await this.discussion()

          await this.sleepService.startSleep(2000)
          this.sendToRoom(buildGameEvent(SpyGameEvent.StageChange), {
            stage: Stage.Results,
          })
          this.state.stage = Stage.Results
          break
        }
        case Stage.Results: {
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
      const suspect = args[0]
      this.sendToRoom(buildGameEvent(SpyGameEvent.VoteAccepted), {
        suspect: suspect,
        issuer: user.userId,
      })
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
