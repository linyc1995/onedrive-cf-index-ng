import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { matchProtectedRoute } from '../utils/protectedRouteHandler'
import useLocalStorage from '../utils/useLocalStorage'

const Auth: FC<{ redirect: string }> = ({ redirect }) => {
  const authTokenPath = matchProtectedRoute(redirect)
  const router = useRouter()
  const [token, setToken] = useState('')
  const [_, setPersistedToken] = useLocalStorage(authTokenPath, '')

  return (
    <div className="mx-auto flex max-w-sm flex-col space-y-4 md:my-10">
      <div className="mx-auto w-3/4 md:w-5/6">
        <Image src={'/images/fabulous-wapmire-weekdays.png'} alt="认证" width={912} height={912} priority />
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">请输入访问密码</div>
      <p className="text-sm font-medium text-gray-500">
        此文件夹及其内部文件已设置密码保护，如果你知道访问密码，请在下方输入。
      </p>

      <div className="flex items-center space-x-2">
        <input
          className="flex-1 rounded border border-gray-200 p-2 font-mono focus:outline-none focus:ring focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-gray-500"
          autoFocus
          type="password"
          placeholder="请输入密码"
          value={token}
          onChange={e => {
            setToken(e.target.value)
          }}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === 'NumpadEnter') {
              setPersistedToken(token)
              router.reload()
            }
          }}
        />
        <button
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          onClick={() => {
            setPersistedToken(token)
            router.reload()
          }}
        >
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </div>
    </div>
  )
}

export default Auth
