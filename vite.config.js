import path from 'node:path'
import { Readable } from 'node:stream'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Runs the Vercel functions in api/ under `npm run dev`, so the Contact form
// can send for real locally. Each file exports one handler per HTTP method
// (e.g. `export async function POST(request)`), taking and returning the
// standard Request and Response, as on Vercel.
function vercelApi() {
  return {
    name: 'vercel-api',
    apply: 'serve',
    configureServer(server) {
      // Server-only secrets from .env (RESEND_API_KEY, …), as Vercel provides them.
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''))

      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([\w-]+)(?:\?|$)/)
        if (!match) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.js`)
          const handler = mod[req.method]
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const hasBody = !['GET', 'HEAD'].includes(req.method)
          const request = new Request(new URL(req.url, `http://${req.headers.host}`), {
            method: req.method,
            headers: req.headers,
            body: hasBody ? Readable.toWeb(req) : undefined,
            duplex: 'half',
          })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApi()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
