import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const LoadingIcon = ({ className }: { className?: string }) => {
  return <FontAwesomeIcon icon="spinner" className={className} />
}

const Loading: FC<{ loadingText?: string }> = ({ loadingText }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <LoadingIcon className="h-8 w-8 animate-spin text-gray-400" />
      <div className="text-sm text-gray-500">{loadingText || '加载中...'}</div>
    </div>
  )
}

export default Loading
