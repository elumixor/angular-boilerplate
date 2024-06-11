import { isSignal } from "@angular/core";
import { nonNull } from "@elumixor/frontils";

export const ID_PROPERTY = Symbol("ID_PROPERTY");

export function getValue<T>(target: object, propertyKey: PropertyKey | undefined) {
    const value = Reflect.get(target, nonNull(propertyKey)) as unknown;
    return (isSignal(value) ? value() : value) as T;
}

export function getId(target: object) {
    return Number(Reflect.get(target, ID_PROPERTY));
}

export function setId(target: object, id: number) {
    Reflect.set(target, ID_PROPERTY, id);
}

const instancesMap = new Map<string, Map<number, object>>();
export function getInstance<T>(entity: string, id: number) {
    return instancesMap.get(entity)?.get(id) as T;
}

export function setInstance(entity: string, id: number, instance: object) {
    let instances = instancesMap.get(entity);
    if (!instances) {
        instances = new Map();
        instancesMap.set(entity, instances);
    }

    instances.set(id, instance);
}

export function deleteInstance(entity: string, id: number) {
    instancesMap.get(entity)?.delete(id);
}
