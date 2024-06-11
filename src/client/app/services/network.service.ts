import { HttpClient } from "@angular/common/http";
import { Injectable, inject, isDevMode } from "@angular/core";
import type { JSONLike } from "@elumixor/frontils";
import { lastValueFrom } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class NetworkService {
    private readonly http = inject(HttpClient);
    private readonly url = isDevMode() ? `http://${import.meta.env.NG_APP_URL}:4000` : "";

    async post<T = unknown>(path: string, params?: JSONLike) {
        // eslint-disable-next-line no-console
        if (isDevMode()) console.log(`API request: ${path}`, params);

        const result = (await lastValueFrom(this.http.post(`${this.url}/api/${path}`, params))) as Promise<T>;

        // eslint-disable-next-line no-console
        if (isDevMode()) console.log(`API Response: ${path}`, result);

        return result;
    }
}
