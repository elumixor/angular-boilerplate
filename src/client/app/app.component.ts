import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterOutlet } from "@angular/router";
import { SimpleNetworkInterface, initialize } from "./pages/saveable";
import { NetworkService } from "@services";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent {
    private readonly titleService = inject(Title);
    private readonly networkService = inject(NetworkService);

    constructor() {
        this.titleService.setTitle("Angular Boilerplate");
        initialize(new SimpleNetworkInterface((path, data) => this.networkService.post(path, data)));
    }
}
