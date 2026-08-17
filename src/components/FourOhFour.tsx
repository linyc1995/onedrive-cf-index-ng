import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { FC } from 'react'
import { PreviewContainer } from './previews/Containers'

const FourOhFour: FC<{ errorMsg?: string }> = ({ errorMsg }) => {
  return (
    <PreviewContainer>
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <FontAwesomeIcon icon="exclamation-triangle" className="h-12 w-12 text-gray-300" />
        <div className="text-xl font-bold text-gray-700 dark:text-gray-200">404 - 未找到资源</div>
        {errorMsg && <div className="max-w-md font-mono text-sm text-gray-500">{errorMsg}</div>}
        <Link
          href="/"
          className="mt-2 rounded border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          返回首页
        </Link>
      </div>
    </PreviewContainer>
  )
}

export default FourOhFour
