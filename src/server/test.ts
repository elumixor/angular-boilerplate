import { eq } from "drizzle-orm";
import { database, boards, cards } from "./db";

const { db, connection } = database();

function cleanStuff() {
    // Remove all tasks, values, and descriptors
    return db.transaction(async (tx) => {
        await tx.delete(cards);
        await tx.delete(boards);
    });
}
function insertStuff() {
    return db.transaction(async (tx) => {
        // Create a board
        const [{ id }] = await tx
            .insert(boards)
            .values([{ name: "Board 1" }, { name: "Board 2" }])
            .returning({ id: boards.id });

        // Create 2 cards in that board
        await tx.insert(cards).values([
            { name: "Card 1", boardId: id },
            { name: "Card 2", boardId: id },
        ]);

        console.log(`Values inserted`);

        return id;
    });
}

void (async () => {
    // const tasksS = schema.tasks;
    // const propertiesS = schema.properties;

    // type Task = typeof schema.tasks.$inferInsert;

    // Clean some data
    await cleanStuff();

    // Insert some data
    const boardId = await insertStuff();

    // Now let's query the data
    const boardsWithCards = await db.query.boards.findMany({
        with: {
            cards: true,
        },
    });

    console.log(boardsWithCards);

    // Let's delete first board
    await db.delete(boards).where(eq(boards.id, boardId));

    // console.log(props, tasks);
    console.log("Done");
    await connection.end();
})();
