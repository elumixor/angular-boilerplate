import { signal } from "@angular/core";
import { entity, property, relation } from "../saveable";
import type { Board } from "./board";

@entity("cards")
export class Card {
    @property()
    readonly name;

    @relation.one("boards", "boardId")
    readonly board;

    constructor(options: { name: string; board: Board }) {
        this.name = signal(options.name);
        this.board = signal(options.board);
    }
}
