import React from 'react'
import { pokepokeCore } from '@/services/pokepokeCore'
import { PokeApp } from '@/services/types'

type ResultComponentPropsType<P> = Omit<P, 'app'> & { app: PokeApp }

export function withApp<Props = any>(
  Component: React.ComponentType<ResultComponentPropsType<Props>>,
): React.FC<Props> {
  return props => <Component {...props} app={pokepokeCore} />
}
