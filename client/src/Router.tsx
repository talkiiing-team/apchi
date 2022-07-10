import { Route, Routes } from 'react-router-dom'
import React, { useEffect } from 'react'

import App from '@/App'
import { Investigate } from '@/pages/Investigate'
import { Profile } from '@/pages/Profile'
import { MyProfile } from '@/pages/MyProfile'
import { EditProfile } from '@/pages/EditProfile'
import Wrapper from '@/Wrapper'
import bridge, { VKBridgeSubscribeHandler } from '@vkontakte/vk-bridge'

const Router = () => {
  useEffect(() => {
    const listener: VKBridgeSubscribeHandler = e => console.log('VKBridge: ', e)
    bridge.subscribe(listener)
    return () => {
      bridge.unsubscribe(listener)
    }
  }, [bridge])

  return (
    <Routes>
      <Route path='/' element={<Wrapper />}>
        <Route path='/' element={<App />}>
          <Route index element={<Investigate />} />
          <Route path='me' element={<Profile />}>
            <Route index element={<MyProfile />} />
            <Route path='edit' element={<EditProfile />} />
          </Route>

          <Route path='*' element={<></>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default Router
