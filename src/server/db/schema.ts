import { relations } from "drizzle-orm";
import { serial, pgTable, text, integer } from "drizzle-orm/pg-core";

export const boards = pgTable("boards", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
});

export const cards = pgTable("cards", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    boardId: integer("boardId")
        .notNull()
        .references(() => boards.id, { onDelete: "cascade" }),
});

export const boardRelations = relations(boards, ({ many }) => ({
    cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
    board: one(boards, {
        fields: [cards.boardId],
        references: [boards.id],
    }),
}));

export const schemas = { boards, cards };
export type SchemaName = keyof typeof schemas;
export type SchemaValue<T extends SchemaName = SchemaName> = (typeof schemas)[T];
export type SchemaInsert<T extends SchemaName = SchemaName> = SchemaValue<T>["$inferInsert"];
export type SchemaCreate<T extends SchemaInsert = SchemaInsert> = Omit<T, "id">;
export type SchemaUpdate<T extends SchemaInsert = SchemaInsert> = Partial<SchemaCreate<T>>;

export const schemaNames = Object.keys(schemas) as SchemaName[];

export function isSchema(name: string): name is SchemaName {
    return schemaNames.includes(name as SchemaName);
}

export function withSchema<T extends SchemaName>(
    name: string,
    callback: <R extends SchemaName>(schema: SchemaValue<R>, name: R) => PromiseLike<unknown>,
) {
    if (!isSchema(name)) throw new Error(`Unknown schema: ${name}`);
    return callback(schemas[name] as (typeof schemas)[T], name as T);
}
