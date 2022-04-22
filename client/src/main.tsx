import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { RecoilRoot, useRecoilSnapshot } from 'recoil'
import Router from '@/Router'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'

import './index.css'
import '@vkontakte/vkui/dist/vkui.css'

function DebugObserver() {
  const snapshot = useRecoilSnapshot()
  useEffect(() => {
    console.debug('The following atoms were modified:')
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node))
    }
  }, [snapshot])

  return null
}

eval(
  '(function () { var script = document.createElement("script"); script.src="//cdn.jsdelivr.net/npm/eruda"; document.body.appendChild(script); script.onload = function () { eruda.init() } })();',
)

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider>
      <AdaptivityProvider>
        <RecoilRoot>
          <DebugObserver />
          <AppRoot className='h-full'>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </AppRoot>
        </RecoilRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
