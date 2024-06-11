import "reflect-metadata";

/* eslint-disable @typescript-eslint/ban-types */
interface SaveData {
    entity?: string;
    properties: Map<string, string>;
    relations: Map<string, { referenceProperty: string; entity: string; kind: "one" | "many" }>;
}

const map = new Map<object, SaveData>();
export const SAVE_DATA = Symbol("save-data");

export function current(target: object): SaveData {
    if (Reflect.has(target, SAVE_DATA)) target = Reflect.get(target, SAVE_DATA) as object;

    let current = map.get(target);
    if (!current) {
        current = { properties: new Map(), relations: new Map() };
        map.set(target, current);
    }

    return current;
}
