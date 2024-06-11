import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { appear } from "@animations";
import { Board } from "../data-classes/board";
import { Card } from "../data-classes/card";
import { construct, destruct, reconstruct } from "../saveable";

@Component({
    selector: "app-example-page",
    standalone: true,
    imports: [FormsModule],
    templateUrl: "./example-page.component.html",
    styleUrl: "./example-page.component.scss",
    animations: [appear("appear")],
})
export class ExamplePageComponent {
    readonly boards = signal<Board[]>([]);
    readonly cards = signal<Card[]>([]);

    constructor() {
        void reconstruct(Board).then((boards) => this.boards.set(boards));
        void reconstruct(Card).then((cards) => this.cards.set(cards));
    }

    addBoard() {
        this.boards.update((boards) => [...boards, construct(Board, { name: "New Board" })]);
    }

    addCard(board: Board) {
        this.cards.update((cards) => [...cards, construct(Card, { name: "New Card", board })]);
    }

    removeBoard(board: Board) {
        this.boards.update((boards) => boards.filter((b) => b !== board));
        destruct(board);
    }

    removeCard(card: Card) {
        this.cards.update((cards) => cards.filter((c) => c !== card));
        destruct(card);
    }
}
