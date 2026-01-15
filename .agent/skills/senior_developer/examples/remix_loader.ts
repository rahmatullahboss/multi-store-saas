import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
// Use relative path for this example file to resolve correctly in the editor
import { users } from "../../../../db/schema"; 

// Define Env interface locally for this standalone example
interface Env {
  DB: D1Database;
}

/**
 * Remix Loader Example
 * 
 * Best Practices:
 * 1. Type Safety: Usage of LoaderFunctionArgs and Drizzle schema.
 * 2. Environment Access: Accessing DB from context.cloudflare.env.
 * 3. Error Handling: Try/Catch with meaningful error responses.
 * 4. Validation: Checking params before query.
 */
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  // Explicitly cast context to align with the project's AppLoadContext using local Env
  const env = (context as any).cloudflare.env as Env;
  
  const db = drizzle(env.DB);
  const userId = params.userId;

  if (!userId) {
    throw new Response("User ID Required", { status: 400 });
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, Number(userId))).get(); // explicit number cast if ID is number

    if (!user) {
      throw new Response("User Not Found", { status: 404 });
    }

    return json({ user });
  } catch (error) {
    console.error("Loader Error:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
}
