import { signal } from "@angular/core";
import { entity, property, relation } from "../saveable";
import type { Card } from "./card";

@entity("boards")
export class Board {
    @property()
    readonly name;

    @relation.many("cards", "boardId")
    readonly cards;

    constructor(options: { name: string; cards?: Card[] }) {
        this.name = signal(options.name);
        this.cards = signal(options.cards ?? []);
    }
}
