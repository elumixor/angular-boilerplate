import "dotenv/config";
import type { Config } from "drizzle-kit";
import { connectionParams } from "./src/server/db";

export default {
    schema: "./src/server/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        ...connectionParams,
    },
} satisfies Config;
