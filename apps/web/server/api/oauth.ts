import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { apps, appInstallations, cacheStore } from '@ozzyl/db'
import { TenantEnv, TenantContext } from '../middleware/tenant'

type Bindings = TenantEnv
type Variables = TenantContext

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Helper: Generate Code
const generateCode = () => crypto.randomUUID().replace(/-/g, '')

// Validation Schemas
const approveSchema = z.object({
  client_id: z.string().min(1),
  scope: z.string().min(1),
})

const tokenSchema = z.object({
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  code: z.string().min(1),
})

// 1. Authorize Endpoint (Initiates Flow)
// GET /api/oauth/authorize?client_id=...&redirect_uri=...&scope=...
app.get('/authorize', async (c) => {
  const clientId = c.req.query('client_id')
  const redirectUri = c.req.query('redirect_uri')
  const scope = c.req.query('scope')
  const state = c.req.query('state') || ''

  if (!clientId || !redirectUri || !scope) {
    return c.text('Missing required parameters: client_id, redirect_uri, scope', 400)
  }

  const db = drizzle(c.env.DB)
  const clientApp = await db.select().from(apps).where(eq(apps.clientId, clientId)).get()

  if (!clientApp) {
    return c.text('Invalid client_id', 400)
  }

  if (clientApp.redirectUrl !== redirectUri) {
     return c.text('Redirect URI mismatch', 400)
  }

  // Redirect to internal consent UI
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    app_name: clientApp.name
  })

  // Redirect to Remix route standardizing around /admin/apps/install
  return c.redirect(`/admin/apps/install?${params.toString()}`)
})

// 2. Approve Endpoint (Called by Internal UI after user clicks "Install")
// POST /api/oauth/approve
// Body: { client_id, scope }
app.post('/approve', zValidator('json', approveSchema), async (c) => {
  const { client_id, scope } = c.req.valid('json')
  const storeId = c.get('storeId')
  
  if (!storeId) return c.json({ error: 'Unauthorized' }, 401)

  const db = drizzle(c.env.DB)
  
  // Generate Authorization Code
  const code = generateCode()
  
  // Store code in cache_store (TTL 10 mins)
  const expiresAt = Date.now() + 10 * 60 * 1000
  
  await db.insert(cacheStore).values({
    key: `oauth_code:${code}`,
    value: JSON.stringify({ storeId, scope, clientId: client_id }),
    expiresAt
  })

  return c.json({ code })
})

// 3. Token Endpoint (Exchanges Code for Token)
// POST /api/oauth/token
app.post('/token', zValidator('json', tokenSchema), async (c) => {
  const { client_id, client_secret, code } = c.req.valid('json')

  const db = drizzle(c.env.DB)

  // 1. Verify Client
  const clientApp = await db.select().from(apps)
    .where(and(eq(apps.clientId, client_id), eq(apps.clientSecret, client_secret)))
    .get()

  if (!clientApp) {
    return c.json({ error: 'invalid_client' }, 401)
  }

  // 2. Verify Code
  const cacheKey = `oauth_code:${code}`
  const cachedCode = await db.select().from(cacheStore).where(eq(cacheStore.key, cacheKey)).get()

  if (!cachedCode || cachedCode.expiresAt < Date.now()) {
    return c.json({ error: 'invalid_grant' }, 400)
  }

  // Parse stored data
  const { storeId, scope } = JSON.parse(cachedCode.value)

  // 3. Generate Access Token
  const accessToken = `atk_${crypto.randomUUID()}`
  
  // 4. Create/Update Installation
  const existingInstall = await db.select().from(appInstallations)
    .where(and(eq(appInstallations.appId, clientApp.id), eq(appInstallations.storeId, storeId)))
    .get()

  if (existingInstall) {
    await db.update(appInstallations)
      .set({ accessToken, scopes: scope, updatedAt: new Date() })
      .where(eq(appInstallations.id, existingInstall.id))
  } else {
    await db.insert(appInstallations).values({
      storeId,
      appId: clientApp.id,
      accessToken,
      scopes: scope,
      status: 'active'
    })
  }

  // 5. Invalidate Code
  await db.delete(cacheStore).where(eq(cacheStore.key, cacheKey))

  return c.json({
    access_token: accessToken,
    scope,
    token_type: 'Bearer'
  })
})

export { app as oauthApi }
