import { relations } from "drizzle-orm"
import { account, session, user } from "@/db/schemas/auth-schema"
import {
  connection,
  credential,
  execution,
  node,
  workflow,
} from "@/db/schemas/workflow-schema"

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  workflows: many(workflow),
  credentials: many(credential),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const workflowRelations = relations(workflow, ({ one, many }) => ({
  user: one(user, {
    fields: [workflow.userId],
    references: [user.id],
  }),
  nodes: many(node),
  connections: many(connection),
  executions: many(execution),
}))

export const credentialRelations = relations(credential, ({ one, many }) => ({
  user: one(user, {
    fields: [credential.userId],
    references: [user.id],
  }),
  nodes: many(node),
}))

export const nodeRelations = relations(node, ({ one, many }) => ({
  workflow: one(workflow, {
    fields: [node.workflowId],
    references: [workflow.id],
  }),
  credential: one(credential, {
    fields: [node.credentialId],
    references: [credential.id],
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

export const executionRelations = relations(execution, ({ one }) => ({
  workflow: one(workflow, {
    fields: [execution.workflowId],
    references: [workflow.id],
  }),
}))
