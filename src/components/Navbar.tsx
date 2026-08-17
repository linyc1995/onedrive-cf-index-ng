import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconName } from '@fortawesome/fontawesome-svg-core'
import { Dialog, DialogBackdrop, Transition } from '@headlessui/react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import siteConfig from '../../config/site.config'

const Navbar = () => {
  const router = useRouter()
  const [tokenPresent, setTokenPresent] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const storedToken = () => {
      for (const r of siteConfig.protectedRoutes) {
        if (localStorage.hasOwnProperty(r)) {
          return true
        }
      }
      return false
    }
    setTokenPresent(storedToken())
  }, [])

  const clearTokens = () => {
    setIsOpen(false)
    siteConfig.protectedRoutes.forEach(r => {
      localStorage.removeItem(r)
    })
    toast.success('已清除所有访问凭证')
    setTimeout(() => {
      router.reload()
    }, 1000)
  }

  return (
    <div className="sticky top-0 z-[100] border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
      <Toaster />
      <div className="mx-auto flex w-full items-center justify-between space-x-4 px-4 py-1">
        <Link href="/" passHref className="flex items-center space-x-2 py-2 hover:opacity-80 dark:text-white md:p-2">
          <Image src={siteConfig.icon} alt="图标" width="25" height="25" priority />
          <span className="hidden font-medium sm:block">{siteConfig.title}</span>
        </Link>

        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
          {siteConfig.links.length !== 0 &&
            siteConfig.links.map((l: { name: string; link: string }) => (
              <a
                key={l.name}
                href={l.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 dark:text-white"
              >
                <FontAwesomeIcon icon={['fab', l.name.toLowerCase() as IconName]} />
                <span className="hidden text-sm font-medium md:inline-block">{l.name}</span>
              </a>
            ))}

          {siteConfig.email && (
            <a href={siteConfig.email} className="flex items-center space-x-2 hover:opacity-80 dark:text-white">
              <FontAwesomeIcon icon={['far', 'envelope']} />
              <span className="hidden text-sm font-medium md:inline-block">邮箱</span>
            </a>
          )}

          {tokenPresent && (
            <button
              className="flex items-center space-x-2 hover:opacity-80 dark:text-white"
              onClick={() => setIsOpen(true)}
            >
              <span className="hidden text-sm font-medium md:inline-block">退出</span>
              <FontAwesomeIcon icon="sign-out-alt" />
            </button>
          )}
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={isOpen} onClose={() => setIsOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogBackdrop className="fixed inset-0 bg-gray-50/80 dark:bg-gray-900/80" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-lg border border-gray-100 bg-white p-6 text-left align-middle transition-all dark:border-gray-800 dark:bg-gray-950">
                <Dialog.Title className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  清除所有访问凭证？
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    这些凭证用于访问加密保护的文件夹，清除后你需要重新输入密码才能再次访问。
                  </p>
                </div>

                <div className="mt-4 max-h-32 overflow-y-scroll font-mono text-sm dark:text-gray-300">
                  {siteConfig.protectedRoutes.map((r, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      <FontAwesomeIcon icon="key" />
                      <span className="truncate">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-end">
                  <button
                    className="mr-3 inline-flex items-center justify-center space-x-2 rounded border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                    onClick={() => setIsOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    className="inline-flex items-center justify-center space-x-2 rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 focus:outline-none dark:bg-gray-800 dark:hover:bg-gray-700"
                    onClick={() => clearTokens()}
                  >
                    <FontAwesomeIcon icon={['far', 'trash-alt']} />
                    <span>全部清除</span>
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Navbar
