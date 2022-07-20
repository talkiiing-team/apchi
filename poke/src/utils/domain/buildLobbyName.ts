const lobbyPrefix = 'lobby'
export const buildLobbyName = (lobbyIdentifier?: string) =>
  lobbyPrefix + (lobbyIdentifier || '')
