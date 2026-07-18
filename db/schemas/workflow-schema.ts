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

export const CredentialType = {
  OPENAI: "OPENAI",
  ANTHROPIC: "ANTHROPIC",
  GEMINI: "GEMINI",
} as const

export type CredentialType =
  (typeof CredentialType)[keyof typeof CredentialType]

export const credentialTypeEnum = pgEnum(
  "credential_type",
  Object.values(CredentialType) as [CredentialType, ...CredentialType[]],
)

export const credential = pgTable("credential", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  type: credentialTypeEnum("type").notNull(),
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

export type Credential = typeof credential.$inferSelect
export type NewCredential = typeof credential.$inferInsert

export const NodeType = {
  INITIAL: "INITIAL",
  MANUAL_TRIGGER: "MANUAL_TRIGGER",
  HTTP_REQUEST: "HTTP_REQUEST",
  GOOGLE_FORM_TRIGGER: "GOOGLE_FORM_TRIGGER",
  STRIPE_TRIGGER: "STRIPE_TRIGGER",
  ANTHROPIC: "ANTHROPIC",
  OPENAI: "OPENAI",
  GEMINI: "GEMINI",
  DISCORD: "DISCORD",
  SLACK: "SLACK",
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
  credentialId: text("credential_id").references(() => credential.id, {
    onDelete: "set null",
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

export const ExecutionStatus = {
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  COMPLETED_WITH_ERRORS: "COMPLETED_WITH_ERRORS",
  FAILED: "FAILED",
} as const

export type ExecutionStatus =
  (typeof ExecutionStatus)[keyof typeof ExecutionStatus]

export const executionStatusEnum = pgEnum(
  "execution_status",
  Object.values(ExecutionStatus) as [ExecutionStatus, ...ExecutionStatus[]],
)

export const execution = pgTable("execution", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, {
      onDelete: "cascade",
    }),
  status: executionStatusEnum("status").default("RUNNING").notNull(),
  error: text("error"),
  errorStack: text("error_stack"),
  startedAt: timestamp("started_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", {
    withTimezone: true,
  }),
  inngestEventId: text("inngest_event_id").notNull().unique(),
  output: jsonb("output"),
  nodeErrors:
    jsonb("node_errors").$type<
      {
        nodeId: string
        nodeName: string
        variableName: string
        message: string
        stack?: string
      }[]
    >(),
})

export type Execution = typeof execution.$inferSelect
export type NewExecution = typeof execution.$inferInsert
