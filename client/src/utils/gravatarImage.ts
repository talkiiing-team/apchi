import md5 from 'crypto-js/md5'

export const gravatarImage = (name: string) =>
  `https://www.gravatar.com/avatar/${md5(name)}?d=monsterid&s=64`
