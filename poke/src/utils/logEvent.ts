export const logEvent = (...message: any[]) =>
  console.log(
    `[${new Date().toLocaleTimeString()}]: [\u001b[33mLOG\u001b[0m] ${message.join(
      ' ',
    )}`,
  )
