import names from './data/names.json'
import adjectives from './data/adj.json'

export const createRandomUserName = () => {
  const nameId = Math.floor(Math.random() * names.length)
  const adjId = Math.floor(Math.random() * adjectives.length)
  const numberSuffix = Math.floor(Math.random() * 100)
  return `${adjectives[adjId]}_${names[nameId]}${numberSuffix}`
}
