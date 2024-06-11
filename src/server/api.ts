import { request } from "@elumixor/angular-server";
import "@elumixor/frontils";
import type { JSONPrimitive } from "@elumixor/frontils";
import { eq } from "drizzle-orm";
import { database, withSchema, type SchemaUpdate } from "./db";

export class Api {
    private readonly db = database().db;

    @request("getEntity")
    async getEntity({ entity, id }: { entity: string; id: number }) {
        const values = await withSchema(entity, (schema) => this.db.select().from(schema).where(eq(schema.id, id)));
        if (!Array.isArray(values)) throw new Error("Expected array");
        return values.first as unknown;
    }

    @request("getAllEntities")
    getAllEntities({ entity }: { entity: string }) {
        return withSchema(entity, (schema) => this.db.select().from(schema));
    }

    @request("createEntity")
    createEntity(initializers: { entity: string; properties: Record<string, JSONPrimitive> }[]) {
        return this.db.transaction(async (tx) => {
            const results = [];
            for (const { entity, properties } of initializers) {
                const result = await withSchema(
                    entity,
                    async (schema) =>
                        (
                            await tx
                                .insert(schema)
                                .values(properties as (typeof schema)["$inferInsert"])
                                .returning({ id: schema.id })
                        ).first,
                );

                results.push(result);
            }

            return results;
        });
    }

    @request("updateEntity")
    async updateEntity(updates: { id: number; properties: SchemaUpdate; entity: string }[]) {
        await this.db.transaction(async (tx) => {
            for (const { id, properties, entity } of updates) {
                //@ts-expect-error Cannot type correctly...
                await withSchema(entity, (schema) => tx.update(schema).set(properties).where(eq(schema.id, id)));
            }
        });
    }

    @request("deleteEntity")
    async deleteEntity(entities: { id: number; entity: string }[]) {
        await this.db.transaction(async (tx) => {
            for (const { id, entity } of entities)
                await withSchema(entity, (schema) => tx.delete(schema).where(eq(schema.id, id)));
        });
    }
}

export type Request<T extends keyof Api> = Parameters<Api[T]>[0];
export type Response<T extends keyof Api> = ReturnType<Api[T]>;
