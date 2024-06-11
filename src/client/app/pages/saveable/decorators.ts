import type { Constructor } from "@elumixor/frontils";
import { observe } from "./observe";
import { SAVE_DATA, current } from "./save-data";

export function entity(name: string) {
    return function <T extends Constructor>(target: T) {
        class Wrapper extends target {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor(...args: any[]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                super(...args);
                observe(prototype, this);
            }
        }

        const prototype = target.prototype as InstanceType<T>;
        current(prototype).entity = name;

        // Make target point to Wrapper
        Reflect.set(Wrapper.prototype, SAVE_DATA, prototype);

        return Wrapper;
    };
}

// Mark property to be watched for changes
export function property(alias?: string) {
    return function (target: object, propertyKey: string) {
        current(target).properties.set(propertyKey, alias ?? propertyKey);
    };
}

export const relation = {
    many(entity: string, referenceProperty: string) {
        return (target: object, propertyKey: string) => {
            current(target).relations.set(propertyKey, { referenceProperty, entity, kind: "many" });
        };
    },
    one(entity: string, referenceProperty: string) {
        return (target: object, propertyKey: string) => {
            current(target).relations.set(propertyKey, { referenceProperty, entity, kind: "one" });
        };
    },
};
