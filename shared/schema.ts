import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Contratos
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  client: text("client").notNull(),
  contact: text("contact"),
  category: text("category").notNull(),
  categories: text("categories").array(),
  status: text("status").notNull().default("active"),
  monthlyValue: decimal("monthly_value", { precision: 12, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  monthlyValues: jsonb("monthly_values"),
  totalValues: jsonb("total_values"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  margin: decimal("margin", { precision: 5, scale: 2 }),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Orçamentos
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  costs: decimal("costs", { precision: 12, scale: 2 }).notNull(),
  moe: decimal("moe", { precision: 12, scale: 2 }),
  fringe: decimal("fringe", { precision: 12, scale: 2 }),
  glosas: decimal("glosas", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Realizados
export const actuals = pgTable("actuals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  costs: decimal("costs", { precision: 12, scale: 2 }).notNull(),
  moe: decimal("moe", { precision: 12, scale: 2 }),
  fringe: decimal("fringe", { precision: 12, scale: 2 }),
  glosas: decimal("glosas", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Colaboradores
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  position: text("position").notNull(),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  fringeRate: decimal("fringe_rate", { precision: 5, scale: 2 }).notNull(),
  hoursWorked: decimal("hours_worked", { precision: 6, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Glosas
export const glosas = pgTable("glosas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Previsões ML
export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id),
  category: text("category").notNull(),
  metric: text("metric").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  predictedValue: decimal("predicted_value", { precision: 12, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Auditoria
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  operation: text("operation").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  userId: text("user_id").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

// Alertas
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  contractId: varchar("contract_id").references(() => contracts.id),
  read: boolean("read").default(false),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relatórios
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  parameters: jsonb("parameters"),
  schedule: text("schedule"),
  recipients: text("recipients").array(),
  status: text("status").notNull().default("draft"),
  approvalStatus: text("approval_status").default("pending"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertContractSchema = createInsertSchema(contracts, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  monthlyValue: z.coerce.string(),
  totalValue: z.coerce.string(),
  margin: z.coerce.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  monthlyValues: z.record(z.string()).nullable().optional(),
  totalValues: z.record(z.string()).nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertActualSchema = createInsertSchema(actuals).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertGlosaSchema = createInsertSchema(glosas).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

// Types
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Actual = typeof actuals.$inferSelect;
export type InsertActual = z.infer<typeof insertActualSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Glosa = typeof glosas.$inferSelect;
export type InsertGlosa = z.infer<typeof insertGlosaSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
