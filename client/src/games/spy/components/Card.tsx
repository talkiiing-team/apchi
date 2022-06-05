import { Role, Location } from '@apchi/games/src/spy'

export const Card = ({
  type,
  location,
}: {
  type: Role
  location?: Location
}) => {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center rounded-xl py-4 ${
        type === Role.Spy
          ? 'bg-rose-200 text-rose-800'
          : 'bg-slate-300 text-slate-800'
      }`}
    >
      {type === Role.Spy ? (
        <div className='flex flex-col items-center space-y-3'>
          <span>Шпион</span>
          <span>Постарайтесь не попасться</span>
        </div>
      ) : (
        <div className='flex flex-col items-center space-y-3'>
          <span>Вы актер</span>
          <span>Не выходите из образа, ваша площадка - {location?.name}</span>
        </div>
      )}
    </div>
  )
}
