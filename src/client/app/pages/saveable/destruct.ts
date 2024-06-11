import { nonNull, nonNullAssert } from "@elumixor/frontils";
import { current } from "./save-data";
import { networkInterface } from "./network-interface";
import { deleteInstance, getId } from "./utils";

export function destruct<T extends object>(instance: T) {
    nonNullAssert(networkInterface);

    const prototype = nonNull(Reflect.getPrototypeOf(instance));

    const { entity } = current(prototype);
    nonNullAssert(entity);

    const id = getId(instance);
    deleteInstance(entity, id);
    void networkInterface.deleteEntity([{ entity, id }]);
}
