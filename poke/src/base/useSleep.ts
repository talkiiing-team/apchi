export const useSleep = () => {
  let undoSleep: CallableFunction = () => {}
  const sleep = (ms: number) =>
    new Promise((res, rej) => {
      undoSleep = () => res(undefined)
      setTimeout(undoSleep, ms)
    })

  return { startSleep: sleep, stopSleep: () => undoSleep() }
}
