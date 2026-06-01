import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const researchFindings = sqliteTable("research_findings", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  status: text("status").notNull().default("draft"),
  confidence: real("confidence"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const researchSources = sqliteTable(
  "research_sources",
  {
    id: integer("id").primaryKey(),
    findingId: integer("finding_id").references(() => researchFindings.id, {
      onDelete: "cascade",
    }),
    title: text("title"),
    url: text("url"),
    publisher: text("publisher"),
    accessedAt: text("accessed_at"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("research_sources_finding_id_idx").on(table.findingId)],
);

export const researchFindingsRelations = relations(researchFindings, ({ many }) => ({
  sources: many(researchSources),
}));

export const researchSourcesRelations = relations(researchSources, ({ one }) => ({
  finding: one(researchFindings, {
    fields: [researchSources.findingId],
    references: [researchFindings.id],
  }),
}));
