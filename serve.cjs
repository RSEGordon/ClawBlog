#!/usr/bin/env node
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

const HTTP_PORT = 20001
const HTTPS_PORT = 20002
const DIST = path.join(process.cwd(), '.vitepress', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml',
  '.webmanifest': 'application/webmanifest',
}

const routeMap = {
  '/': 'index.html',
  '/about': 'pages/about.html',
  '/archives': 'pages/archives.html',
  '/categories': 'pages/categories.html',
  '/tags': 'pages/tags.html',
  '/cc': 'pages/cc.html',
  '/link': 'pages/link.html',
  '/privacy': 'pages/privacy.html',
  '/project': 'pages/project.html',
}

function handle(req, res) {
  let url = decodeURIComponent(req.url.split('?')[0])
  if (url === '/') url = '/'

  const direct = path.join(DIST, url)
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    const ext = path.extname(direct)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' })
    res.end(fs.readFileSync(direct))
    return
  }

  if (routeMap[url]) {
    const file = path.join(DIST, routeMap[url])
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fs.readFileSync(file))
      return
    }
  }

  // 嵌套分类/标签页（优先级高于通用 /pages/ 分支）
  if (url.startsWith('/pages/categories/') || url.startsWith('/pages/tags/')) {
    const file = path.join(DIST, url.slice(1) + '.html')
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fs.readFileSync(file))
      return
    }
  }

  if (url.startsWith('/posts/')) {
    const file = path.join(DIST, url.slice(1) + '.html')
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fs.readFileSync(file))
      return
    }
  }

  if (url.startsWith('/pages/')) {
    const file = path.join(DIST, url.slice(1) + '.html')
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fs.readFileSync(file))
      return
    }
  }

  if (url.startsWith('/page/')) {
    const file = path.join(DIST, url.slice(1) + '.html')
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fs.readFileSync(file))
      return
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(fs.readFileSync(path.join(DIST, 'index.html')))
}

http.createServer((req, res) => handle(req, res)).listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`HTTP: http://172.26.141.241:${HTTP_PORT}`)
})

const ssl = {
  key: fs.readFileSync('/tmp/blog-key.pem'),
  cert: fs.readFileSync('/tmp/blog-cert.pem')
}
https.createServer(ssl, (req, res) => handle(req, res)).listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`HTTPS: https://172.26.141.241:${HTTPS_PORT}`)
})
