import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectionParams } from "./connection";
import * as schema from "./schema";

export function database() {
    const connection = postgres({ ...connectionParams });
    const db = drizzle(connection, { schema });
    return { db, connection };
}
