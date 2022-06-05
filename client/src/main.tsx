import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { RecoilRoot, useRecoilSnapshot } from 'recoil'
import Router from '@/Router'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'

import './index.css'
import '@vkontakte/vkui/dist/vkui.css'
import bridge from '@vkontakte/vk-bridge'

console.log('trying to subscribe VKBridge')
bridge.send('VKWebAppInit')
// .then(r => console.log('start sent', r))
// .catch(e => console.log('bridge cannot connect ', e))

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
        <AppRoot className='h-full'>
          <RecoilRoot>
            <DebugObserver />
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </RecoilRoot>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
