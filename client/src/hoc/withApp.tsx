import React from 'react'
import { pokepokeCore } from '@/services/pokepokeCore'
import { PokeApp } from '@/services/types'

type ResultComponentPropsType<P> = Omit<P, 'app'> & { app: PokeApp }

export function withApp<P = any>(
  Component: React.ComponentType<ResultComponentPropsType<P>>,
): React.FC<ResultComponentPropsType<P>> {
  return props => <Component {...props} app={pokepokeCore} />
}
