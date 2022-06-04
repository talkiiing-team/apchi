export const selectRandom = (array: Array<any>) => {
  return array[Math.floor(Math.random() * array.length)]
}
