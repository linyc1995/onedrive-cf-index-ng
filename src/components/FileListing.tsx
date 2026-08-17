import type { OdFileObject, OdFolderChildren, OdFolderObject } from '../types'
import { ParsedUrlQuery } from 'querystring'
import { FC, MouseEventHandler, SetStateAction, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import emojiRegex from 'emoji-regex'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import useLocalStorage from '../utils/useLocalStorage'
import { getPreviewType, preview } from '../utils/getPreviewType'
import { useProtectedSWRInfinite } from '../utils/fetchWithSWR'
import { getExtension, getRawExtension, getFileIcon } from '../utils/getFileIcon'
import { getStoredToken } from '../utils/protectedRouteHandler'
import {
  DownloadingToast,
  downloadMultipleFiles,
  downloadTreelikeMultipleFiles,
  traverseFolder,
} from './MultiFileDownloader'
import { layouts } from './SwitchLayout'
import Loading, { LoadingIcon } from './Loading'
import FourOhFour from './FourOhFour'
import Auth from './Auth'
import TextPreview from './previews/TextPreview'
import MarkdownPreview from './previews/MarkdownPreview'
import CodePreview from './previews/CodePreview'
import OfficePreview from './previews/OfficePreview'
import AudioPreview from './previews/AudioPreview'
import VideoPreview from './previews/VideoPreview'
import PDFPreview from './previews/PDFPreview'
import URLPreview from './previews/URLPreview'
import ImagePreview from './previews/ImagePreview'
import DefaultPreview from './previews/DefaultPreview'
import { PreviewContainer } from './previews/Containers'
import FolderListLayout from './FolderListLayout'
import FolderGridLayout from './FolderGridLayout'

// 禁用服务端渲染的预览组件
const EPUBPreview = dynamic(() => import('./previews/EPUBPreview'), {
  ssr: false,
})

/**
 * 将 URL 查询参数转换为路径字符串
 */
const queryToPath = (query?: ParsedUrlQuery) => {
  if (query) {
    const { path } = query
    if (!path) return '/'
    if (typeof path === 'string') return `/${encodeURIComponent(path)}`
    return `/${path.map(p => encodeURIComponent(p)).join('/')}`
  }
  return '/'
}

// 处理文件名中的 emoji 图标
const renderEmoji = (name: string) => {
  const emoji = emojiRegex().exec(name)
  return { render: emoji && !emoji.index, emoji }
}

const formatChildName = (name: string) => {
  const { render, emoji } = renderEmoji(name)
  return render ? name.replace(emoji ? emoji[0] : '', '').trim() : name
}

export const ChildName: FC<{ name: string; folder?: boolean }> = ({ name, folder }) => {
  const original = formatChildName(name)
  const extension = folder ? '' : getRawExtension(original)
  const prename = folder ? original : original.substring(0, original.length - extension.length)
  return (
    <span className="truncate before:float-right before:content-[attr(data-tail)]" data-tail={extension}>
      {prename}
    </span>
  )
}

export const ChildIcon: FC<{ child: OdFolderChildren }> = ({ child }) => {
  const { render, emoji } = renderEmoji(child.name)
  return render ? (
    <span>{emoji ? emoji[0] : '📁'}</span>
  ) : (
    <FontAwesomeIcon icon={child.file ? getFileIcon(child.name, { video: Boolean(child.video) }) : ['far', 'folder']} />
  )
}

export const Checkbox: FC<{
  checked: 0 | 1 | 2
  onChange: () => void
  title: string
  indeterminate?: boolean
}> = ({ checked, onChange, title, indeterminate }) => {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.checked = Boolean(checked)
      if (indeterminate) {
        ref.current.indeterminate = checked == 1
      }
    }
  }, [ref, checked, indeterminate])

  const handleClick: MouseEventHandler = e => {
    if (ref.current) {
      if (e.target === ref.current) {
        e.stopPropagation()
      } else {
        ref.current.click()
      }
    }
  }

  return (
    <span
      title={title}
      className="inline-flex cursor-pointer items-center rounded p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={handleClick}
    >
      <input
        className="form-check-input cursor-pointer"
        type="checkbox"
        value={checked ? '1' : ''}
        ref={ref}
        aria-label={title}
        onChange={onChange}
      />
    </span>
  )
}

export const Downloading: FC<{ title: string; style: string }> = ({ title, style }) => {
  return (
    <span title={title} className={`${style} rounded`} role="status">
      <LoadingIcon className="svg-inline--fa inline-block h-4 w-4 animate-spin" />
    </span>
  )
}

const FileListing: FC<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})
  const [totalSelected, setTotalSelected] = useState<0 | 1 | 2>(0)
  const [totalGenerating, setTotalGenerating] = useState<boolean>(false)
  const [folderGenerating, setFolderGenerating] = useState<{
    [key: string]: boolean
  }>({})
  const router = useRouter()
  const hashedToken = getStoredToken(router.asPath)
  const [layout, _] = useLocalStorage('preferredLayout', layouts[0])
  const path = queryToPath(query)
  const { data, error, size, setSize } = useProtectedSWRInfinite(path)

  if (error) {
    // 403 错误表示未完成初始授权，跳转到 OAuth 页面
    if (error.status === 403) {
      router.push('/onedrive-oauth/step-1')
      return <div />
    }
    return (
      <PreviewContainer>
        {error.status === 401 ? <Auth redirect={path} /> : <FourOhFour errorMsg={JSON.stringify(error.message)} />}
      </PreviewContainer>
    )
  }

  if (!data) {
    return (
      <PreviewContainer>
        <Loading loadingText={'加载中...'} />
      </PreviewContainer>
    )
  }

  const responses: any[] = data ? [].concat(...data) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && typeof data[data.length - 1]?.next === 'undefined')
  const onlyOnePage = data && typeof data[0].next === 'undefined'

  if ('folder' in responses[0]) {
    // 展开所有分页数据，合并为完整文件列表
    const folderChildren = [].concat(...responses.map(r => r.folder.value)) as OdFolderObject['value']
    // 查找 README.md 文件用于渲染
    const readmeFile = folderChildren.find(c => c.name.toLowerCase() === 'readme.md')

    // 筛选出纯文件（排除文件夹和密码文件）
    const getFiles = () => folderChildren.filter(c => !c.folder && c.name !== '.password')

    // 全选状态计算
    const genTotalSelected = (selected: { [key: string]: boolean }) => {
      const selectInfo = getFiles().map(c => Boolean(selected[c.id]))
      const [hasT, hasF] = [selectInfo.some(i => i), selectInfo.some(i => !i)]
      return hasT && hasF ? 1 : !hasF ? 2 : 0
    }

    const toggleItemSelected = (id: string) => {
      let val: SetStateAction<{ [key: string]: boolean }>
      if (selected[id]) {
        val = { ...selected }
        delete val[id]
      } else {
        val = { ...selected, [id]: true }
      }
      setSelected(val)
      setTotalSelected(genTotalSelected(val))
    }

    const toggleTotalSelected = () => {
      if (genTotalSelected(selected) == 2) {
        setSelected({})
        setTotalSelected(0)
      } else {
        setSelected(Object.fromEntries(getFiles().map(c => [c.id, true])))
        setTotalSelected(2)
      }
    }

    // 选中文件下载处理
    const handleSelectedDownload = () => {
      const folderName = path.substring(path.lastIndexOf('/') + 1)
      const folder = folderName ? decodeURIComponent(folderName) : undefined
      const files = getFiles()
        .filter(c => selected[c.id])
        .map(c => ({
          name: c.name,
          url: `/api/raw?path=${path}/${encodeURIComponent(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`,
        }))

      if (files.length == 1) {
        const el = document.createElement('a')
        el.style.display = 'none'
        document.body.appendChild(el)
        el.href = files[0].url
        el.click()
        el.remove()
      } else if (files.length > 1) {
        setTotalGenerating(true)
        const toastId = toast.loading(<DownloadingToast router={router} />)
        downloadMultipleFiles({ toastId, router, files, folder })
          .then(() => {
            setTotalGenerating(false)
            toast.success('已完成选中文件的下载', { id: toastId })
          })
          .catch(() => {
            setTotalGenerating(false)
            toast.error('选中文件下载失败', { id: toastId })
          })
      }
    }

    // 复制选中文件直链
    const handleSelectedPermalink = (baseUrl: string) => {
      return getFiles()
        .filter(c => selected[c.id])
        .map(
          c =>
            `${baseUrl}/api/raw?path=${path}/${encodeURIComponent(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`
        )
        .join('\n')
    }

    // 文件夹递归下载
    const handleFolderDownload = (path: string, id: string, name?: string) => () => {
      const files = (async function* () {
        for await (const { meta: c, path: p, isFolder, error } of traverseFolder(path)) {
          if (error) {
            toast.error(`文件夹 ${p} 下载失败: ${error.status} ${error.message} 已跳过继续下载`)
            continue
          }
          const hashedTokenForPath = getStoredToken(p)
          yield {
            name: c?.name,
            url: `/api/raw?path=${p}${hashedTokenForPath ? `&odpt=${hashedTokenForPath}` : ''}`,
            path: p,
            isFolder,
          }
        }
      })()

      setFolderGenerating({ ...folderGenerating, [id]: true })
      const toastId = toast.loading(<DownloadingToast router={router} />)
      downloadTreelikeMultipleFiles({
        toastId,
        router,
        files,
        basePath: path,
        folder: name,
      })
        .then(() => {
          setFolderGenerating({ ...folderGenerating, [id]: false })
          toast.success('文件夹下载完成', { id: toastId })
        })
        .catch(() => {
          setFolderGenerating({ ...folderGenerating, [id]: false })
          toast.error('文件夹下载失败', { id: toastId })
        })
    }

    // 传递给布局组件的参数
    const folderProps = {
      toast,
      path,
      folderChildren,
      selected,
      toggleItemSelected,
      totalSelected,
      toggleTotalSelected,
      totalGenerating,
      handleSelectedDownload,
      folderGenerating,
      handleSelectedPermalink,
      handleFolderDownload,
    }

    return (
      <>
        <Toaster />
        {layout.name === 'Grid' ? <FolderGridLayout {...folderProps} /> : <FolderListLayout {...folderProps} />}

        {!onlyOnePage && (
          <div className="rounded-b border border-t-0 border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
            <div className="border-b border-gray-100 p-3 text-center text-sm text-gray-500 dark:border-gray-800">
              {`- 已显示 ${size} 页 ` +
                (isLoadingMore ? `共 ... 个项目 -` : `共 ${folderChildren.length} 个项目 -`)}
            </div>
            <button
              className={`flex w-full items-center justify-center space-x-2 p-3 disabled:cursor-not-allowed ${
                isLoadingMore || isReachingEnd ? 'opacity-60' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore || isReachingEnd}
            >
              {isLoadingMore ? (
                <>
                  <LoadingIcon className="inline-block h-4 w-4 animate-spin" />
                  <span>加载中...</span>{' '}
                </>
              ) : isReachingEnd ? (
                <span>没有更多文件了</span>
              ) : (
                <>
                  <span>加载更多</span>
                  <FontAwesomeIcon icon="chevron-circle-down" />
                </>
              )}
            </button>
          </div>
        )}

        {readmeFile && (
          <div className="mt-4">
            <MarkdownPreview file={readmeFile} path={path} standalone={false} />
          </div>
        )}
      </>
    )
  }

  // 单文件预览逻辑
  if ('file' in responses[0] && responses.length === 1) {
    const file = responses[0].file as OdFileObject
    const previewType = getPreviewType(getExtension(file.name), { video: Boolean(file.video) })

    if (previewType) {
      switch (previewType) {
        case preview.image:
          return <ImagePreview file={file} />
        case preview.text:
          return <TextPreview file={file} />
        case preview.code:
          return <CodePreview file={file} />
        case preview.markdown:
          return <MarkdownPreview file={file} path={path} />
        case preview.video:
          return <VideoPreview file={file} />
        case preview.audio:
          return <AudioPreview file={file} />
        case preview.pdf:
          return <PDFPreview file={file} />
        case preview.office:
          return <OfficePreview file={file} />
        case preview.epub:
          return <EPUBPreview file={file} />
        case preview.url:
          return <URLPreview file={file} />
        default:
          return <DefaultPreview file={file} />
      }
    } else {
      return <DefaultPreview file={file} />
    }
  }

  return (
    <PreviewContainer>
      <FourOhFour errorMsg={`无法预览 ${path}`} />
    </PreviewContainer>
  )
}

export default FileListing
