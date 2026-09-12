import { test as setup } from '@playwright/test'
import { createClerkClient } from '@clerk/backend'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.test.local') })

const authFile = path.join(__dirname, '../playwright/.clerk/user.json')

setup('authenticate and save state to storage', async ({ page }) => {
  setup.setTimeout(90_000)

  const email = process.env.E2E_CLERK_USER_EMAIL
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!email || !secretKey) {
    throw new Error('Missing E2E_CLERK_USER_EMAIL or CLERK_SECRET_KEY in test environment')
  }

  const clerk = createClerkClient({ secretKey })
  const users = await clerk.users.getUserList({ emailAddress: [email] })
  if (!users.data.length) {
    throw new Error(`Test user ${email} not found in Clerk instance`)
  }
  const user = users.data[0]

  const signInToken = await clerk.signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 300 })
  const session = await clerk.sessions.createSession({ userId: user.id })
  const token = await clerk.sessions.getToken(session.id)

  const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN || 'https://peaceful-pheasant-9933.clerk.accounts.dev'
  const handshakeUrl = `${issuer}/v1/client/handshake?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F&__clerk_api_version=2025-11-10&suffixed_cookies=false&__clerk_hs_reason=dev-browser-missing&format=nonce`

  let dbJwt: string | undefined
  try {
    const hsRes = await fetch(handshakeUrl, { redirect: 'manual' })
    const loc = hsRes.headers.get('location')
    if (loc) {
      const hs = new URL(loc).searchParams.get('__clerk_handshake')
      if (hs) {
        const payload = JSON.parse(Buffer.from(hs.split('.')[1], 'base64').toString())
        const match = payload.handshake?.find((c: string) => c.includes('__clerk_db_jwt'))
        if (match) {
          dbJwt = match.split('__clerk_db_jwt=')[1].split(';')[0]
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch Clerk dev-browser token from handshake endpoint:', err)
  }

  const cookies = [
    { name: '__session', value: token.jwt, domain: 'localhost', path: '/' },
    { name: '__client_uat', value: String(Math.floor(Date.now() / 1000)), domain: 'localhost', path: '/' },
  ]
  if (dbJwt) {
    cookies.push({ name: '__clerk_db_jwt', value: dbJwt, domain: 'localhost', path: '/' })
  }

  await page.context().addCookies(cookies)

  await page.goto('/')
  await page.waitForFunction(
    () =>
      Boolean(
        (
          window as unknown as {
            Clerk?: { loaded?: boolean }
          }
        ).Clerk?.loaded
      ),
    null,
    { timeout: 30_000 }
  )

  await page.evaluate(async (ticket) => {
    const clerk = (
      window as unknown as {
        Clerk: {
          client: {
            signIn: {
              create: (params: {
                strategy: string
                ticket: string
              }) => Promise<{ status: string; createdSessionId: string }>
            }
          }
          setActive: (params: { session: string }) => Promise<void>
        }
      }
    ).Clerk
    const res = await clerk.client.signIn.create({ strategy: 'ticket', ticket })
    if (res.status === 'complete') {
      await clerk.setActive({ session: res.createdSessionId })
    }
  }, signInToken.token)

  await page.waitForURL((url) => !url.hostname.endsWith('accounts.dev'), { timeout: 30_000 })
  await page.waitForLoadState('domcontentloaded')

  const newBoardButton = page.getByRole('button', { name: /new board/i }).first()
  await newBoardButton.waitFor({ state: 'visible', timeout: 20_000 })

  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})