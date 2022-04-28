import { Engine, EngineUtils } from '../../common/Engine'
import { v4 as uuidv4 } from 'uuid'
import cards from '../assets/cards'
import { Crud, Game, User, useSleep, useTable } from '@apchi/shared'
import {
  Actions,
  buildGameEvent,
  Card,
  CourtData,
  isBlack,
  isRed,
  MafiaGameEvent,
  Role,
  Shot,
  Stage,
  UserGameData,
} from '../shared'

const cardList: Card[] = cards.map(card => ({
  ...card,
  id: uuidv4(),
}))

const getAutoCardSet = (count: number) => {
  // from 4 up to 6
  let roles: Role[] = []
  switch (count) {
    case 3:
      roles = [Role.Mafia, Role.Don, Role.Police]
      break
    case 4:
      roles = [Role.Mafia, Role.Don, Role.Police, Role.Doctor]
      break
    case 5:
      roles = [Role.Mafia, Role.Mafia, Role.Don, Role.Police, Role.Doctor]
      break
    default:
    case 6:
      roles = [
        Role.Mafia,
        Role.Mafia,
        Role.Mafia,
        Role.Don,
        Role.Police,
        Role.Doctor,
      ]
      break
  }
  return roles.map(role => cardList.find(card => card.role === role)!)
}

export const RoleWakeSequence: Role[] = [
  Role.Mafia,
  Role.Don,
  Role.Police,
  Role.Maniac,
  Role.Doctor,
  Role.Slut,
]

export type MafiaState = {
  stage: Stage
  round: number
  currentRole?: Role
  userGameStore: Crud<UserGameData, 'userId'>
  courtStorage: Crud<CourtData, 'courtId'>
}

export class MafiaEngine extends Engine<MafiaState> {
  gameId = 'simple-mafia'
  static meta: Game = {
    id: 'simple-mafia',
    name: 'Mafia',
    description: 'Классическая или спортивная мафия в новой упаковке!',
    requirements: {
      maxUsers: 12,
      minUsers: 1,
    },
  }

  private sleepService = useSleep()

  private useTable = useTable(this.STORAGE)

  private cards: Card[] = []
  private narratorId!: User['userId']
  private roleSet: Role[] = []

  private mafiaCount: number = 0
  private citizenCount: number = 0

  protected onGameStart() {
    this.state.stage = Stage.Launch
    this.sendToRoom(buildGameEvent(MafiaGameEvent.StageChange), {
      stage: Stage.Launch,
    })

    setTimeout(() => {
      this.state.stage = Stage.GameSetup
    }, 5000)
  }

  private giveCardsToUsers() {
    this.users.forEach((user, i) => {
      this.state.userGameStore?.insert(user.userId, {
        userId: user.userId,
        role: this.cards[i].role,
        card: this.cards[i],
        score: 0,
      })
    })
  }

  private async discussion() {
    console.log('discuss')
  }

  protected async onStateChange(
    key: keyof MafiaState,
    oldValue: any,
    newValue: any,
  ): Promise<void> {
    console.log(
      `[${new Date().toLocaleTimeString()}]: [\u001b[33mMafia\u001b[0m] State updated [${key}] ${oldValue} → ${newValue}`,
    )
    if (key === 'stage') {
      switch (newValue) {
        case Stage.GameSetup: {
          this.sendToRoom(buildGameEvent(MafiaGameEvent.StageChange), {
            stage: Stage.GameSetup,
          })
          this.sendToRoom(buildGameEvent(MafiaGameEvent.TimeLeft), {
            time: 180,
          })
          await this.sleepService.startSleep(180 * 1000)
          if (!this.cards) this.cards = getAutoCardSet(this.users.length)
          this.roleSet = this.cards.reduce(
            (roles, card) =>
              !roles.includes(card.role) ? [...roles, card.role] : roles,
            [] as Role[],
          )
          this.mafiaCount = this.cards.filter(card => isBlack(card.role)).length
          this.mafiaCount = this.cards.filter(card => isRed(card.role)).length
          this.state.stage = Stage.Starting
          break
        }
        case Stage.Starting: {
          this.sendToRoom(buildGameEvent(MafiaGameEvent.StageChange), {
            stage: Stage.Starting,
          })
          this.sendToRoom(buildGameEvent(MafiaGameEvent.TimeLeft), {
            time: 5,
          })
          this.tempTimer = setTimeout(() => {
            this.state.stage = Stage.Giveaway
          }, 5 * 1000)
          break
        }
        case Stage.Giveaway: {
          this.sendToRoom(buildGameEvent(MafiaGameEvent.StageChange), {
            stage: Stage.Giveaway,
          })
          this.state.userGameStore!.forEach(user => {
            if (user.role === Role.Mafia || user.role === Role.Don) {
              const extra: (UserGameData & User)[] = this.state
                .userGameStore!.findAll(user => isBlack(user.role!))
                .map(user => ({
                  ...user,
                  ...this.users.find(u => u.userId === user.userId)!,
                }))
              this.sendToUser(
                user.userId,
                buildGameEvent(MafiaGameEvent.ReceiveCard),
                { card: user.card, extra },
              )
            } else {
              this.sendToUser(
                user.userId,
                buildGameEvent(MafiaGameEvent.ReceiveCard),
                { card: user.card },
              )
            }
          })
          this.sendToRoom(buildGameEvent(MafiaGameEvent.TimeLeft), {
            time: 25,
          })
          this.tempTimer = setTimeout(() => {
            this.state.stage = Stage.Day
          }, 25 * 1000)
          break
        }
        case Stage.Day: {
          this.sendToRoom(buildGameEvent(MafiaGameEvent.StageChange), {
            stage: Stage.Day,
          })

          // Send all resulting information

          await this.discussion()

          await this.sleepService.startSleep(2000)
          this.sendToRoom(buildGameEvent(MafiaGameEvent.StageChange), {
            stage: Stage.Night,
          })

          await this.sleepService.startSleep(5000)
          this.state.round = this.state.round + 1
          this.state.stage = Stage.Night
          break
        }
        case Stage.Night: {
          for await (const currentRole of RoleWakeSequence) {
            if (!this.roleSet.includes(currentRole)) continue

            this.state.currentRole = currentRole

            if (currentRole === Role.Mafia) this.killCoShoot = []

            this.sendToRoom(buildGameEvent(MafiaGameEvent.MakeActionByRole), {
              role: currentRole,
            })

            this.sendToRoom(buildGameEvent(MafiaGameEvent.TimeLeft), {
              time: 20,
            })
            await this.sleepService.startSleep(20 * 1000)

            if (currentRole === Role.Mafia) {
              const victims = Array.from(
                this.killCoShoot
                  .reduce(
                    (a, v) => a.add(v.victim),
                    new Set([]) as Set<User['userId']>,
                  )
                  .values(),
              )
              if (victims.length !== 1) {
                // nesostrel
              } else {
                // sostrel
              }
            }
          }
          this.state.currentRole = undefined

          await this.sleepService.startSleep(2000)

          this.state.stage = Stage.Day
          break
        }
      }
    }
  }

  protected onGameFinish(): void {}

  private tempTimer!: ReturnType<typeof setTimeout>

  private killCoShoot: Shot[] = []

  public applyAction(user: User, action: Actions, ...args: any[]): any {
    console.log('got action === ', action)
    if (action === Actions.TakeNarration) {
      if (this.state.stage !== Stage.GameSetup)
        throw { reason: 'Right now is not a setup stage', code: 403 }
      this.narratorId = user.userId
      this.sendToRoom(buildGameEvent(MafiaGameEvent.NarratorUpdated), {
        narrator: user,
      })
    }
    if (action === Actions.SubmitCardSet) {
      // with []
      if (this.state.stage !== Stage.GameSetup)
        throw { reason: 'Right now is not a setup stage', code: 403 }

      const cards = args[0] as Card['id'][]

      if (cards.length !== this.users.length - 1)
        throw { reason: 'Invalid number of cards', code: 400 }

      this.cards = cards.map(id => cardList.find(card => card.id === id)!)

      return { status: 'Successfully voted' }
    }
    if (action === Actions.StartGame) {
      if (this.state.stage !== Stage.GameSetup)
        throw { reason: 'Right now is not a setup stage', code: 403 }

      this.sleepService.stopSleep()
      return { status: 'Successfully voted' }
    }
    if (action === Actions.Kill) {
      if (this.state.stage !== Stage.Night)
        throw { reason: 'Not a night', code: 403 }
      if (this.state.currentRole !== Role.Mafia)
        throw { reason: 'Not mafias turn', code: 403 }
      if (
        ![Role.Mafia, Role.Don].includes(
          this.state.userGameStore.get(user.userId)!.role!,
        )
      )
        throw { reason: 'Not a murderer', code: 403 }

      if (this.killCoShoot.find(kill => kill.killer === user.userId))
        throw { reason: 'Already shot', code: 403 }

      const victim = args[0] as User['userId']

      this.killCoShoot = [...this.killCoShoot, { victim, killer: user.userId }]
      if (this.killCoShoot.length === this.mafiaCount)
        this.sleepService.stopSleep()
      return { status: 'Successfully voted' }
    }
  }

  constructor(utils: EngineUtils) {
    const initialState: MafiaState = {
      stage: Stage.Off,
      round: 0,
      currentRole: undefined,
    } as MafiaState
    super(initialState, { users: [] }, utils)
    this.state.userGameStore = this.useTable('userGameStore', 'userId')
    this.state.courtStorage = this.useTable('courtStorage', 'courtId')
  }
}
