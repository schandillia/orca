import { relations } from "drizzle-orm"
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"
import { user } from "@/db/schemas/auth-schema"

export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
})

export type Workflow = typeof workflow.$inferSelect
export type NewWorkflow = typeof workflow.$inferInsert

export const NodeType = {
  INITIAL: "INITIAL",
  MANUAL_TRIGGER: "MANUAL_TRIGGER",
  HTTP_REQUEST: "HTTP_REQUEST",
  GOOGLE_FORM_TRIGGER: "GOOGLE_FORM_TRIGGER",
  STRIPE_TRIGGER: "STRIPE_TRIGGER",
} as const
export type NodeType = (typeof NodeType)[keyof typeof NodeType]
export const nodeTypeEnum = pgEnum(
  "node_type",
  Object.values(NodeType) as [string, ...string[]],
)
export const node = pgTable("node", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  type: nodeTypeEnum("type").notNull(),
  position: jsonb("position").notNull(),
  data: jsonb("data").default({}).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type Node = typeof node.$inferSelect
export type NewNode = typeof node.$inferInsert

export const connection = pgTable(
  "connection",
  {
    id: text("id").primaryKey(),
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflow.id, {
        onDelete: "cascade",
      }),
    fromNodeId: text("from_node_id")
      .notNull()
      .references(() => node.id, {
        onDelete: "cascade",
      }),
    toNodeId: text("to_node_id")
      .notNull()
      .references(() => node.id, {
        onDelete: "cascade",
      }),
    fromOutput: text("from_output").default("main").notNull(),
    toInput: text("to_input").default("main").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("connection_from_to_unique").on(
      table.workflowId,
      table.fromNodeId,
      table.toNodeId,
      table.fromOutput,
      table.toInput,
    ),
  ],
)

export type Connection = typeof connection.$inferSelect
export type NewConnection = typeof connection.$inferInsert

export const workflowRelations = relations(workflow, ({ one, many }) => ({
  user: one(user, {
    fields: [workflow.userId],
    references: [user.id],
  }),
  nodes: many(node),
  connections: many(connection),
}))

export const nodeRelations = relations(node, ({ one, many }) => ({
  workflow: one(workflow, {
    fields: [node.workflowId],
    references: [workflow.id],
  }),
  outgoingConnections: many(connection, {
    relationName: "FromNode",
  }),
  incomingConnections: many(connection, {
    relationName: "ToNode",
  }),
}))

export const connectionRelations = relations(connection, ({ one }) => ({
  workflow: one(workflow, {
    fields: [connection.workflowId],
    references: [workflow.id],
  }),
  fromNode: one(node, {
    fields: [connection.fromNodeId],
    references: [node.id],
    relationName: "FromNode",
  }),
  toNode: one(node, {
    fields: [connection.toNodeId],
    references: [node.id],
    relationName: "ToNode",
  }),
}))
