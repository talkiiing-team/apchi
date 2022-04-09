import { Route, Routes } from 'react-router-dom'
import React from 'react'

import App from '@/App'
import { Investigate } from '@/pages/Investigate'
import { Profile } from '@/pages/Profile'
import { MyProfile } from '@/pages/MyProfile'
import { EditProfile } from '@/pages/EditProfile'
import { Auth } from '@/pages/Auth'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

const Router = () => {
  return (
    <Routes>
      <Route path='/' element={<App />}>
        <Route index element={<Investigate />} />
        <Route path='me' element={<Profile />}>
          <Route index element={<MyProfile />} />
          <Route path='edit' element={<EditProfile />} />
        </Route>

        <Route path='auth' element={<Auth />}>
          <Route index element={<Login />} />
          <Route path='register' element={<Register />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default Router
