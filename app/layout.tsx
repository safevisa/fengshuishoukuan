import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: '京世盈風水 - 專業風水擺件商城',
  description: '香港京世盈有限公司專業提供風水擺件、開光物品、風水諮詢服務，助您改善家居風水，提升運勢',
  keywords: '風水擺件,開光物品,風水諮詢,京世盈,香港風水,風水商城',
  authors: [{ name: '香港京世盈有限公司' }],
  openGraph: {
    title: '京世盈風水 - 專業風水擺件商城',
    description: '專業提供風水擺件、開光物品、風水諮詢服務',
    type: 'website',
    locale: 'zh_HK',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
