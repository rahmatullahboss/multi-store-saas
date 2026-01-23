import { createYoga, createSchema } from 'graphql-yoga'
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { products, productVariants, collections } from '@ozzyl/db'
import { TenantEnv, TenantContext } from '../middleware/tenant'

// Define the GraphQL schema
const typeDefs = /* GraphQL */ `
  type Product {
    id: ID!
    title: String!
    description: String
    price: Float!
    compareAtPrice: Float
    images: [String]
    variants: [Variant]
    category: String
  }

  type Variant {
    id: ID!
    title: String
    price: Float
    sku: String
    inventory: Int
    available: Boolean
  }

  type Collection {
    id: ID!
    title: String!
    slug: String!
    description: String
    products(first: Int): [Product]
  }

  type Shop {
    id: ID!
    name: String!
    currency: String
    domain: String
  }

  type Query {
    shop: Shop
    products(first: Int, after: String): [Product]
    product(id: ID!): Product
    collections(first: Int): [Collection]
    collection(slug: String!): Collection
  }
`

// Helper: Safely parse JSON with fallback
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const app = new Hono<{ Bindings: TenantEnv; Variables: TenantContext }>()

app.use('/', async (c) => {
  const db = drizzle(c.env.DB)
  const store = c.get('store')

  if (!store) {
    return c.json({ error: 'Store not found' }, 404)
  }

  const yoga = createYoga({
    schema: createSchema({
      typeDefs,
      resolvers: {
        Query: {
          shop: () => ({
            id: store.id,
            name: store.name,
            currency: store.currency,
            domain: store.customDomain || `${store.subdomain}.ozzyl.com`
          }),
          products: async (_, { first = 20 }) => {
            const results = await db.select().from(products)
              .where(eq(products.storeId, store.id))
              .limit(first || 20)
            
            return results.map(p => ({
              ...p,
              images: safeJsonParse<string[]>(p.images, [])
            }))
          },
          product: async (_, { id }) => {
            const result = await db.select().from(products)
              .where(and(eq(products.storeId, store.id), eq(products.id, Number(id))))
              .get()
            
            if (!result) return null;
            return {
               ...result,
               images: safeJsonParse<string[]>(result.images, [])
            }
          },
          collections: async (_, { first = 20 }) => {
            return db.select().from(collections)
              .where(eq(collections.storeId, store.id))
              .limit(first || 20)
          },
          collection: async (_, { slug }) => {
            return db.select().from(collections)
              .where(and(eq(collections.storeId, store.id), eq(collections.slug, slug)))
              .get()
          }
        },
        Product: {
           variants: async (parent) => {
             // TODO: Use DataLoader for batching to avoid N+1 queries
             return db.select().from(productVariants)
               .where(eq(productVariants.productId, Number(parent.id)))
           }
        }
      }
    }),
    graphqlEndpoint: '/api/graphql',
    fetchAPI: { Response }
  })

  return yoga.handle(c.req.raw, c.env)
})

export { app as graphqlApi }
