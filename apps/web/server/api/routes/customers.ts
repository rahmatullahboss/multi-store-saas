import { Hono } from 'hono';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, like, or } from 'drizzle-orm';
import * as schema from '@db/schema';
import { 
  customers, 
  customerAddresses, 
  customerNotes,
} from '@db/schema';
import { HTTPException } from 'hono/http-exception';

// ============================================================================
// SCHEMAS
// ============================================================================

const createCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'banned', 'archived']).default('active'),
  notes: z.string().optional(),
  address: z.object({
    address1: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const addNoteSchema = z.object({
  content: z.string().min(1),
  isPinned: z.boolean().default(false),
});

const addAddressSchema = z.object({
  type: z.enum(['shipping', 'billing']).default('shipping'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Type exports
type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
type AddNoteInput = z.infer<typeof addNoteSchema>;
type AddAddressInput = z.infer<typeof addAddressSchema>;

// ============================================================================
// APP
// ============================================================================

type AppEnv = {
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    storeId: number;
  };
};

const app = new Hono<AppEnv>();

// Helper to parse JSON body with Zod
async function parseBody<T>(c: any, schema: z.ZodType<T, any, any>): Promise<T> {
  const body = await c.req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HTTPException(400, { message: result.error.message });
  }
  return result.data;
}

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/customers - List customers
app.get('/', async (c) => {
  const storeId = c.get('storeId');
  const db = drizzle(c.env.DB, { schema });
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search');
  const segment = c.req.query('segment');
  const offset = (page - 1) * limit;

  // Build base query
  const baseCondition = eq(customers.storeId, storeId);
  const conditions = [baseCondition];

  if (search) {
    const searchPattern = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(customers.name, searchPattern),
        like(customers.email, searchPattern),
        like(customers.phone, searchPattern)
      )!
    );
  }

  if (segment && segment !== 'all') {
    conditions.push(eq(customers.segment, segment as 'vip' | 'churn_risk' | 'window_shopper' | 'new' | 'regular'));
  }

  const result = await db
    .select()
    .from(customers)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(customers.createdAt));

  return c.json({
    data: result,
    page,
    limit,
  });
});

// GET /api/customers/:id - Detail view
app.get('/:id', async (c) => {
  const storeId = c.get('storeId');
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.storeId, storeId)),
    with: {
      addresses: true,
      notes: {
        orderBy: desc(customerNotes.createdAt),
      },
    }
  });

  if (!customer) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json(customer);
});

// POST /api/customers - Create
app.post('/', async (c) => {
  const storeId = c.get('storeId');
  const data = await parseBody<CreateCustomerInput>(c, createCustomerSchema);
  const db = drizzle(c.env.DB, { schema });

  const newCustomer = await db.insert(customers).values({
    storeId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    status: data.status,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();

  // If address provided, add it
  if (data.address) {
    await db.insert(customerAddresses).values({
      customerId: newCustomer.id,
      address1: data.address.address1,
      city: data.address.city,
      zip: data.address.zip,
      country: data.address.country,
      isDefault: true,
    });
  }

  return c.json(newCustomer, 201);
});

// PUT /api/customers/:id - Update
app.put('/:id', async (c) => {
  const storeId = c.get('storeId');
  const id = parseInt(c.req.param('id'));
  const data = await parseBody<UpdateCustomerInput>(c, updateCustomerSchema);
  const db = drizzle(c.env.DB, { schema });

  const updated = await db.update(customers)
    .set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      status: data.status,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.storeId, storeId)))
    .returning()
    .get();

  if (!updated) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  return c.json(updated);
});

// POST /api/customers/:id/notes - Add Note
app.post('/:id/notes', async (c) => {
  const storeId = c.get('storeId');
  const id = parseInt(c.req.param('id'));
  const data = await parseBody<AddNoteInput>(c, addNoteSchema);
  const db = drizzle(c.env.DB, { schema });

  // Verify ownership
  const exists = await db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.storeId, storeId)),
  });

  if (!exists) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  const note = await db.insert(customerNotes).values({
    customerId: id,
    content: data.content,
    isPinned: data.isPinned,
    createdAt: new Date(),
  }).returning().get();

  return c.json(note, 201);
});

// POST /api/customers/:id/addresses - Add Address
app.post('/:id/addresses', async (c) => {
  const storeId = c.get('storeId');
  const id = parseInt(c.req.param('id'));
  const data = await parseBody<AddAddressInput>(c, addAddressSchema);
  const db = drizzle(c.env.DB, { schema });

  // Verify ownership
  const exists = await db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.storeId, storeId)),
  });

  if (!exists) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  // If setting default, unset others
  if (data.isDefault) {
    await db.update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.customerId, id));
  }

  const address = await db.insert(customerAddresses).values({
    customerId: id,
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    company: data.company,
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    province: data.province,
    zip: data.zip,
    country: data.country,
    phone: data.phone,
    isDefault: data.isDefault,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning().get();

  return c.json(address, 201);
});

// DELETE /api/customers/:id - Delete
app.delete('/:id', async (c) => {
  const storeId = c.get('storeId');
  const id = parseInt(c.req.param('id'));
  const db = drizzle(c.env.DB, { schema });

  // Verify ownership
  const exists = await db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.storeId, storeId)),
  });

  if (!exists) {
    throw new HTTPException(404, { message: 'Customer not found' });
  }

  // Multi-tenant safety: always scope deletes by storeId.
  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.storeId, storeId)));

  return c.json({ success: true, message: 'Customer deleted' });
});

export default app;
