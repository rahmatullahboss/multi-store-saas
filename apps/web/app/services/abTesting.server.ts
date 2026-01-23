import type { Database } from "../lib/db.server";
import { abTests } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * A/B TESTING SERVICE
 * Handles traffic splitting and variant assignment.
 */

// Simple hash function to deterministically assign user to bucket
function getBucket(testKey: string, sessionId: string): 'A' | 'B' {
    let hash = 0;
    const combined = `${testKey}:${sessionId}`;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const normalized = Math.abs(hash) % 100; // 0-99
    
    // Default 50/50 split
    return normalized < 50 ? 'A' : 'B'; 
}

export async function getAbTestVariant(
    db: Database, 
    storeId: number, 
    testKey: string, 
    sessionId: string
) {
    // 1. Find active test
    const test = await db.query.abTests.findFirst({
        where: and(
            eq(abTests.storeId, storeId),
            eq(abTests.testKey, testKey),
            eq(abTests.status, 'active')
        )
    });

    if (!test) return null; // No test running

    // 2. Assign variant based on session hash
    const variant = getBucket(testKey, sessionId);
    
    // 3. Async track view (fire and forget for perf)
    // In real prod, use a queue. Here we just update.
    trackAbView(db, test.id, variant).catch(console.error);

    return {
        variant: variant === 'A' ? test.variantA : test.variantB,
        variantLabel: variant
    };
}

async function trackAbView(db: Database, testId: number, variant: 'A' | 'B') {
    if (variant === 'A') {
        await db.update(abTests)
            .set({ viewsA: sql`views_a + 1` })
            .where(eq(abTests.id, testId));
    } else {
        await db.update(abTests)
            .set({ viewsB: sql`views_b + 1` })
            .where(eq(abTests.id, testId));
    }
}

export async function trackAbConversion(
    db: Database, 
    storeId: number, 
    testKey: string, 
    sessionId: string
) {
    const test = await db.query.abTests.findFirst({
        where: and(
            eq(abTests.storeId, storeId),
            eq(abTests.testKey, testKey),
            eq(abTests.status, 'active')
        )
    });

    if (!test) return;

    const variant = getBucket(testKey, sessionId);

    if (variant === 'A') {
        await db.update(abTests)
            .set({ conversionsA: sql`conversions_a + 1` })
            .where(eq(abTests.id, test.id));
    } else {
        await db.update(abTests)
            .set({ conversionsB: sql`conversions_b + 1` })
            .where(eq(abTests.id, test.id));
    }
}


