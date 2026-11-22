import { Readable } from 'node:stream'
import server from '../dist/server/server.js'

export default async function handler(req, res) {
  // If invoked with a Web Standard Request and no res (Edge / fetch-style)
  if (!res && req && typeof req.text === 'function') {
    return server.fetch(req)
  }

  // Standard Node.js Serverless runtime (req, res)
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
    const url = new URL(req.url, `${proto}://${host}`)

    const headers = new Headers()
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          for (const v of val) headers.append(key, v)
        } else {
          headers.set(key, val)
        }
      }
    }

    const init = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = Readable.toWeb(req)
      init.duplex = 'half'
    }

    const webRequest = new Request(url.href, init)
    const webResponse = await server.fetch(webRequest)

    res.statusCode = webResponse.status
    webResponse.headers.forEach((val, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        const cookies = typeof webResponse.headers.getSetCookie === 'function'
          ? webResponse.headers.getSetCookie()
          : [val]
        res.setHeader('set-cookie', cookies)
      } else {
        res.setHeader(key, val)
      }
    })

    if (webResponse.body) {
      const reader = webResponse.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err) {
    console.error('Server error rendering page:', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('content-type', 'text/plain')
    }
    res.end('Internal Server Error: ' + (err?.message || String(err)))
  }
}

export const config = {
  runtime: 'nodejs',
}
