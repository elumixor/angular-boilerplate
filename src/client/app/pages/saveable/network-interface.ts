import { EnvironmentInjector, inject } from "@angular/core";
import type { Request } from "../../../../server/api";
import type { JSONLike } from "@elumixor/frontils";

export interface INetworkInterface {
    getEntity<T>(request: Request<"getEntity">): Promise<T>;
    getAllEntities<T>(request: Request<"getAllEntities">): Promise<T[]>;
    createEntity(request: Request<"createEntity">): Promise<{ id: number }[]>;
    updateEntity(request: Request<"updateEntity">): Promise<void>;
    deleteEntity(request: Request<"deleteEntity">): Promise<void>;
}

export class SimpleNetworkInterface implements INetworkInterface {
    readonly getEntity = this.makeRequest("getEntity");
    readonly getAllEntities = this.makeRequest("getAllEntities");
    readonly createEntity = this.makeRequest("createEntity");
    readonly updateEntity = this.makeRequest("updateEntity");
    readonly deleteEntity = this.makeRequest("deleteEntity");

    constructor(readonly poster: <T>(path: string, params?: JSONLike) => Promise<T>) {}

    private makeRequest<T extends keyof INetworkInterface>(kind: T) {
        return ((request: Request<T>) => this.poster(kind, request)) as INetworkInterface[T];
    }
}

export let networkInterface: INetworkInterface | undefined;
export let injector: EnvironmentInjector | undefined;

export function initialize(inter: INetworkInterface) {
    injector = inject(EnvironmentInjector);
    networkInterface = inter;
}
