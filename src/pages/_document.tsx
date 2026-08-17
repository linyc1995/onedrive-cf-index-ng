import Document, { Html, Head, Main, NextScript } from 'next/document'
import siteConfig from '../../config/site.config'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          <meta name="description" content={siteConfig.title} />
          <link rel="icon" href={siteConfig.icon} />
          
          {/* 安全判断：字体链接存在且为数组时才遍历渲染 */}
          {Array.isArray(siteConfig.googleFontLinks) && siteConfig.googleFontLinks.length > 0 &&
            siteConfig.googleFontLinks.map((link, i) => (
              <link key={i} href={link} rel="stylesheet" />
            ))
          }
        </Head>
        <body className="bg-white dark:bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
