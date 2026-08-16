import axios from 'redaxios'

import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath, getAccessToken } from '.'

import apiConfig from '../../../config/api.config'

import siteConfig from '../../../config/site.config'

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function sanitiseQuery(query: string): string {
  const sanitisedQuery = query
    .replace(/'/g, "''")
    .replace('<', ' &lt; ')
    .replace('>', ' &gt; ')
    .replace('?', ' ')
    .replace('/', ' ')
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextRequest): Promise<Response> {
  const accessToken = await getAccessToken()

  const { q: searchQuery = '' } = Object.fromEntries(req.nextUrl.searchParams)

  if (typeof searchQuery === 'string') {
    // 微软搜索 API 不支持路径限制，从根目录搜索
    const searchApi = `${apiConfig.driveApi}/root/search(q='${sanitiseQuery(searchQuery)}')`

    try {
      const { data } = await axios.get(searchApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: 'id,name,file,folder,parentReference',
          top: siteConfig.maxItems,
        },
      })

      // ✅ 新增：过滤搜索结果，只保留在 baseDirectory 下的文件
      const baseDir = siteConfig.baseDirectory === '/' ? '' : siteConfig.baseDirectory.replace(/\/$/, '')
      const filteredResults = data.value.filter((item: any) => {
        if (!item.parentReference?.path) return false
        // parentReference.path 格式: /drive/root:/path/to/file
        const itemPath = item.parentReference.path.split('root:')[1] || ''
        // 如果 baseDirectory 是根目录，不过滤
        if (baseDir === '') return true
        // 只保留在 baseDirectory 下的文件
        return itemPath.startsWith(baseDir)
      })

      return NextResponse.json(filteredResults, {
        headers: {
          'Cache-Control': apiConfig.cacheControlHeader,
        },
      })
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error?.response?.data ?? 'Internal server error.' }), {
        status: error?.response?.status ?? 500,
      })
    }
  } else {
    return NextResponse.json([])
  }
}
