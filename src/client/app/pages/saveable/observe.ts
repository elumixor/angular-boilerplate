import { effect, runInInjectionContext } from "@angular/core";
import { nonNull } from "@elumixor/frontils";
import { current } from "./save-data";
import { getId, getValue } from "./utils";
import { injector, networkInterface } from "./network-interface";

export const SKIP_UPDATE = Symbol("SKIP_UPDATE");

export function skipUpdate(target: object) {
    return !!Reflect.get(target, SKIP_UPDATE);
}

export function observe(target: object, instance: object) {
    const { entity, properties } = current(target);

    if (!entity) throw new Error("Entity name not set");

    console.log("observing", instance, "for entity", entity, "with properties", properties);

    runInInjectionContext(nonNull(injector), () => {
        for (const [propertyKey, alias] of properties) {
            let firstRun = true; // we don't want to update on creation

            effect(() => {
                const id = getId(instance);
                const value = getValue(instance, propertyKey);

                if (firstRun) {
                    firstRun = false;
                    return;
                }

                if (skipUpdate(instance)) return;
                const properties = { [alias]: value };
                void networkInterface?.updateEntity([{ entity, id, properties }]);
            });
        }

        for (const [propertyKey, { referenceProperty, kind }] of current(target).relations) {
            effect(() => {
                const id = getId(instance);
                console.log("Trying to get value", propertyKey);
                const value = getValue<object | object[]>(instance, propertyKey);

                if (skipUpdate(instance)) return;
                if (kind === "one") {
                    console.log("getting id of", value);
                    const relationId = getId(value as object);
                    const properties = { [referenceProperty]: relationId };
                    void networkInterface?.updateEntity([{ entity, id, properties }]);
                } else {
                    const relationIds = (value as object[]).map((v) => getId(v));

                    const updates = relationIds.map((relationId) => ({
                        entity,
                        id,
                        properties: { [referenceProperty]: relationId },
                    }));

                    void networkInterface?.updateEntity(updates);
                }
            });
        }
    });
}
