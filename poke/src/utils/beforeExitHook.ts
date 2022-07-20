const createBeforeExitHook = () => {
  const callbackCollection: Array<() => void> = []
  const addBeforeExitHook = (callback: () => any) => {
    const id = callbackCollection.push(callback)
    return () => {
      delete callbackCollection[id]
    }
  }

  const deleteBeforeExitHook = (callback: () => any) => {
    callbackCollection.filter(cb => cb !== callback)
  }

  return { addBeforeExitHook, deleteBeforeExitHook, callbackCollection }
}

export const { addBeforeExitHook, deleteBeforeExitHook, callbackCollection } =
  createBeforeExitHook()
