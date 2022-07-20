export const createSleepService = () => {
  let undoSleep: CallableFunction = () => {}
  const sleep = (ms: number) =>
    new Promise(res => {
      undoSleep = () => res(undefined)
      setTimeout(undoSleep, ms)
    })

  return { startSleep: sleep, stopSleep: () => undoSleep() }
}
