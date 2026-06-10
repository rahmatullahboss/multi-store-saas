import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { inArray, desc, eq, sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

const visitors = sqliteTable('visitors', { id: integer('id').primaryKey() });
const visitorMessages = sqliteTable('visitor_messages', {
    id: integer('id').primaryKey(),
    visitorId: integer('visitor_id'),
    content: text('content'),
    createdAt: integer('created_at', { mode: 'timestamp' })
});

const sqlite = new Database(':memory:');
const db = drizzle(sqlite);

db.run(sql`CREATE TABLE visitors (id INTEGER PRIMARY KEY)`);
db.run(sql`CREATE TABLE visitor_messages (id INTEGER PRIMARY KEY, visitor_id INTEGER, content TEXT, created_at INTEGER)`);

db.insert(visitors).values({ id: 1 }).run();
db.insert(visitorMessages).values({ id: 1, visitorId: 1, content: 'first', createdAt: new Date(1000) }).run();
db.insert(visitorMessages).values({ id: 2, visitorId: 1, content: 'second', createdAt: new Date(2000) }).run();

const aggregatedMessages = db
  .select({
    visitorId: visitorMessages.visitorId,
    count: sql<number>`count(${visitorMessages.id})`,
    lastMessage: visitorMessages.content, // SQLite magic: bare column with aggregate in GROUP BY gives value from same row
    lastActive: sql<number>`max(${visitorMessages.createdAt})`
  })
  .from(visitorMessages)
  .where(inArray(visitorMessages.visitorId, [1]))
  .groupBy(visitorMessages.visitorId)
  .all();

console.log(aggregatedMessages);
