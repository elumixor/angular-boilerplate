import { isSignal, runInInjectionContext, type WritableSignal } from "@angular/core";
import { nonNull, nonNullAssert, type Constructor, type JSONPrimitive } from "@elumixor/frontils";
import { injector, networkInterface } from "./network-interface";
import { SKIP_UPDATE } from "./observe";
import { current } from "./save-data";
import { getId, getInstance, getValue, setId, setInstance } from "./utils";
export async function reconstruct<T extends Constructor>(Target: T) {
    if (!networkInterface) throw new Error("Network interface not set");

    const { entity, properties } = current(Target.prototype as object);
    nonNullAssert(entity);

    const values = await networkInterface.getAllEntities<Record<string, unknown>>({ entity });

    return values.map((initializer) => {
        const instance = runInInjectionContext(nonNull(injector), () => new Target(initializer));

        const id = initializer["id"] as number;
        setId(instance, id);
        setInstance(entity, id, instance);

        for (const [propertyKey, alias] of properties) {
            const sig = Reflect.get(instance, propertyKey) as unknown;
            if (!isSignal(sig)) throw new Error("Property is not a signal");

            const value = initializer[alias];
            (sig as WritableSignal<unknown>).set(value);
        }

        for (const [propertyKey, { referenceProperty, entity, kind }] of current(Target.prototype as object)
            .relations) {
            if (kind !== "one") continue;

            const sig = Reflect.get(instance, propertyKey) as unknown;
            if (!isSignal(sig)) throw new Error("Property is not a signal");

            const valueId = initializer[referenceProperty] as number;
            const value = getInstance(entity, valueId);

            (sig as WritableSignal<unknown>).set(value);
        }

        return instance as InstanceType<T>;
    });
}

export function construct<T extends Constructor>(Target: T, initializer: ConstructorParameters<T>[0]) {
    if (!networkInterface) throw new Error("Network interface not set");

    const instance = runInInjectionContext(nonNull(injector), () => new Target(initializer));

    const { properties: propMap, entity, relations: relMap } = current(Target.prototype as object);
    nonNullAssert(entity);

    Reflect.set(instance, SKIP_UPDATE, true);

    const properties = Object.fromEntries(
        propMap.entries().map(([property, alias]) => [alias, getValue<JSONPrimitive>(instance, property)]),
    );

    const relations = Object.fromEntries(
        relMap
            .entries()
            .filter(([, { kind }]) => kind === "one")
            .map(([property, { referenceProperty }]) => {
                const value = getValue<object>(instance, property);
                const valueId = getId(value);
                return [referenceProperty, valueId];
            }),
    );

    const merged = { ...properties, ...relations };

    void networkInterface.createEntity([{ entity, properties: merged }]).then(([{ id }]) => {
        setId(instance, id);
        setInstance(entity, id, instance);
        Reflect.set(instance, SKIP_UPDATE, false);
    });

    return instance as InstanceType<T>;
}
