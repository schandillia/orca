import { pgTable, text } from "drizzle-orm/pg-core"

export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
})
