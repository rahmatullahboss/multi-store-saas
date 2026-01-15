import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../../../../../db/schema"; 

// Define Env interface locally for this standalone example
interface Env {
  DB: D1Database;
}

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  // 1. Explicit Context Typing
  const env = (context as any).cloudflare.env as Env;
  const db = drizzle(env.DB);
  
  // 2. Validation
  if (!params.userId) throw new Response("Missing ID", { status: 400 });

  // 3. Error Handling
  try {
    const user = await db.select().from(users).where(eq(users.id, Number(params.userId))).get();
    if (!user) throw new Response("Not Found", { status: 404 });
    return json({ user });
  } catch (e) {
    console.error(e);
    throw new Response("Server Error", { status: 500 });
  }
}
