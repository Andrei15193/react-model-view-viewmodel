import type { IEventHandler, INotifyPropertiesChanged, ICollectionChange } from "./events";
import type { IReadOnlyObservableCollection } from "./observable-collection";

/** A core interface for read-only validatable objects. */
export interface IReadOnlyValidatable {
    /** A flag indicating whether the field is valid. Generally, when there is no associated error message. */
    readonly isValid: boolean;

    /** A flag indicating whether the field is invalid. Generally, when there is an associated error message. */
    readonly isInvalid: boolean;

    /** An error message (or translation key) providing information as to why the field is invalid. */
    readonly error: string | undefined;
}

/** A core interface for validatable objects. */
export interface IValidatable extends IReadOnlyValidatable {
    /** An error message (or translation key) providing information as to why the field is invalid. */
    error: string | undefined;
}

/** A validation config covering scenarios where one object may depend on other objects to determine their valid state. */
export interface IValidationConfig<TValidatable extends IValidatable & INotifyPropertiesChanged> {
    /** The object that is being validated. */
    readonly target: TValidatable;
    /** Additional validation triggers, if the target or any of the triggers notify of properties changing then a validation is done on the target. */
    readonly triggers?: readonly INotifyPropertiesChanged[];
    /** A collection of property names to watch for. The validation is carried out only if the specified properties have changed.
     * These come in addition to the filters that is placed on the target. The target is not validated when its error, isValid and isInvalid properties change.
    */
    readonly watchedProperties?: readonly string[];
}

/** A validatable selector callback.
 * @param source - The item from which a validatable is selected.
*/
export type ValidatableSelectorCallback<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged> = (source: TItem) => TValidatable;

/** A validation config selector callback.
 * @param source - The item from which a validation config is selected.
*/
export type ValidationConfigSelectorCallback<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged> = (source: TItem) => IValidationConfig<TValidatable>;

/** A validation callback signature.
 * @param validatable - The object being validated.
*/
export type ValidatorCallback<TValidatable extends IValidatable> = (validatable: TValidatable) => string | undefined;

/** A signature for callbacks that unregister event subscriptions. */
export type UnsubscribeCallback = () => void;

/** A validation callback signature for collection bound validators.
 * @param validatable - The object being validated.
 * @param item - The item from which the validatable has been selected.
 * @param collection - The collection to which the item belongs.
*/
export type CollectionItemValidatorCallback<TValidatable extends IValidatable, TItem> = (validatable: TValidatable, item: TItem, collection: readonly TItem[]) => string | undefined;

/** Registers and applies the provided validators returning a cleanup callback.
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable a new validation is carried out.
 * @param validatableOrConfig - The object that will be validated by the provided validators.
 * @param validators - The callback validators that handle validation.
*/
export function registerValidators<TValidatable extends IValidatable & INotifyPropertiesChanged>(validatable: TValidatable, validators: readonly (ValidatorCallback<TValidatable> | any)[]): UnsubscribeCallback;/** Registers and applies the provided validators returning a cleanup callback.

/** Registers and applies the provided validators returning a cleanup callback.
* The validators are applied one after the other until the first one returns an error message (a value different from undefined).
* Whenever a property has changed (except for error, isValid and isInvalid) on the validatable a new validation is carried out.
* @param validatableOrConfig - The object that will be validated by the provided validators.
* @param validators - The callback validators that handle validation.
*/
export function registerValidators<TValidatable extends IValidatable & INotifyPropertiesChanged>(validatableConfig: IValidationConfig<TValidatable>, validators: readonly (ValidatorCallback<TValidatable> | any)[]): UnsubscribeCallback;

/** Registers and applies the provided validators returning a cleanup callback.
 * The validators are applies one after the other until the first one returns an error message (a value different from undefined).
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable a new validation is carried out.
 * @param validatableOrConfig - The object that will be validated by the provided validators.
 * @param validators - The callback validators that handle validation.
 * @returns Returns a callback that unsubscribes all event handlers, a cleanup callback.
*/
export function registerValidators<TValidatable extends IValidatable & INotifyPropertiesChanged>(validatableOrConfig: TValidatable | IValidationConfig<TValidatable>, validators: readonly (ValidatorCallback<TValidatable> | any)[]): UnsubscribeCallback {
    let target: TValidatable;
    let triggers: readonly INotifyPropertiesChanged[] | undefined = undefined;
    let watchedProperties: readonly string[] | undefined = undefined;
    if (isValidationConfig(validatableOrConfig)) {
        target = validatableOrConfig.target;
        triggers = validatableOrConfig.triggers;
        watchedProperties = validatableOrConfig.watchedProperties;
    }
    else
        target = validatableOrConfig;

    const validatableChangedEventHandler: IEventHandler<readonly string[]> = {
        handle(_, changedProperties): void {
            if (!containsAny<keyof IValidatable>(changedProperties as readonly (keyof IValidatable)[], ['error', 'isValid', 'isInvalid'])
                && (watchedProperties === undefined || containsAny(changedProperties, watchedProperties)))
                applyValidators(target, validators);
        }
    };
    const triggerChangedEventHandler: IEventHandler<readonly string[]> = {
        handle(_, changedProperties): void {
            if (watchedProperties === undefined || containsAny(changedProperties, watchedProperties))
                applyValidators(target, validators);
        }
    };

    applyValidators(target, validators);
    target.propertiesChanged.subscribe(validatableChangedEventHandler);
    triggers !== undefined && triggers.forEach(trigger => trigger.propertiesChanged.subscribe(triggerChangedEventHandler));
    return () => {
        triggers !== undefined && triggers.forEach(trigger => trigger.propertiesChanged.unsubscribe(triggerChangedEventHandler));
        target.propertiesChanged.unsubscribe(validatableChangedEventHandler);
    }
}

/** Registers and applies the provided validators to each item and returns a cleanup callback.
 * When one item changes the entire collection is revalidated, this is useful when items must have a unique value.
 * @param collection - The collection to watch, validators are registed for each item. When the collection changes all subscription and unsubscriptions are done accordingly.
 * @param selector - A callback that selects a validatable for each item. The returned value must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators - The callback validators that handle validation for each item.
*/
export function registerCollectionValidators<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatable> | ValidationConfigSelectorCallback<TItem, TValidatable>, validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | any)[]): UnsubscribeCallback;

/** Registers and applies the provided validators to each item and returns a cleanup callback.
 * When one item changes the entire collection is revalidated, this is useful when items must have a unique value.
 * @param collection - The collection to watch, validators are registed for each item. When the collection changes all subscription and unsubscriptions are done accordingly.
 * @param selector - A callback that selects a validation config for each item. The returned target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators - The callback validators that handle validation for each item.
*/
export function registerCollectionValidators<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidationConfigSelectorCallback<TItem, TValidatable> | ValidationConfigSelectorCallback<TItem, TValidatable>, validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | any)[]): UnsubscribeCallback;

/** Registers and applies the provided validators to each item and returns a cleanup callback.
 * When one item changes the entire collection is revalidated, this is useful when items must have a unique value.
 * @param collection - The collection to watch, validators are registed for each item. When the collection changes all subscription and unsubscriptions are done accordingly.
 * @param selector - A callback that selects a validatable or validation config for each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators - The callback validators that handle validation for each item.
*/
export function registerCollectionValidators<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatable> | ValidationConfigSelectorCallback<TItem, TValidatable>, validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | any)[]): UnsubscribeCallback {
    const validatableChangedEventHandler: IEventHandler<readonly string[]> = {
        handle(_, changedProperties): void {
            if (!containsAny(changedProperties, ['error', 'isValid', 'isInvalid']))
                validateItems(changedProperties);
        }
    };
    const triggerChangedEventHandler: IEventHandler<readonly string[]> = {
        handle(_, changedProperties): void {
            validateItems(changedProperties);
        }
    };
    const collectionChangedEventHandler: IEventHandler<ICollectionChange<TItem>> = {
        handle(_: IReadOnlyObservableCollection<TItem>, collectionChange): void {
            collectionChange.removedItems && collectionChange.removedItems.forEach(unwatchItem);
            collectionChange.addedItems && collectionChange.addedItems.forEach(watchItem);
            validateItems();
        }
    };

    collection.forEach(watchItem);
    validateItems();
    collection.colllectionChanged.subscribe(collectionChangedEventHandler);

    return () => {
        collection.colllectionChanged.unsubscribe(collectionChangedEventHandler);
        collection.forEach(unwatchItem);
    };

    function watchItem(item: TItem): void {
        if (item !== undefined && item !== null) {
            const validatableOrConfig = selector(item);
            if (isValidationConfig(validatableOrConfig)) {
                const { target, triggers } = validatableOrConfig;
                target.propertiesChanged.subscribe(validatableChangedEventHandler);
                triggers && triggers.forEach(trigger => trigger.propertiesChanged.subscribe(triggerChangedEventHandler));
            }
            else {
                const validatable: TValidatable = validatableOrConfig;
                validatable.propertiesChanged.subscribe(validatableChangedEventHandler);
            }
        }
    }

    function unwatchItem(item: TItem): void {
        if (item !== undefined && item !== null) {
            const validatableOrConfig = selector(item);
            if (isValidationConfig(validatableOrConfig)) {
                const { target, triggers } = validatableOrConfig;
                triggers && triggers.forEach(trigger => trigger.propertiesChanged.unsubscribe(triggerChangedEventHandler));
                target.propertiesChanged.unsubscribe(validatableChangedEventHandler);
            }
            else {
                const validatable: TValidatable = validatableOrConfig;
                validatable.propertiesChanged.unsubscribe(validatableChangedEventHandler);
            }
        }
    }

    function validateItems(changedProperties?: readonly string[]): void {
        collection.forEach((item, _, collection) => {
            const validatableOrConfig = selector(item);
            if (isValidationConfig(validatableOrConfig)) {
                const { target, watchedProperties } = validatableOrConfig;
                if (!changedProperties || !watchedProperties || containsAny(changedProperties, watchedProperties))
                    applyCollectionItemValidators(target, item, collection, validators);
            }
            else {
                const validatable: TValidatable = validatableOrConfig;
                applyCollectionItemValidators(validatable, item, collection, validators);
            }
        });
    }
}

function containsAny<T>(items: readonly T[], values: readonly T[]): boolean {
    let index = 0;
    while (index < items.length && values.every(value => value !== items[index]))
        index++;
    return index < items.length;
}

function applyValidators<TValidatable extends IValidatable>(validatable: TValidatable, validators: readonly (ValidatorCallback<TValidatable> | any)[]): void {
    let error = undefined;
    let index = 0;
    while (index < validators.length && error === undefined) {
        const validator = validators[index];
        if (validator && validator.call && validator.apply)
            error = validator(validatable);
        index++;
    }
    validatable.error = error;
}

function applyCollectionItemValidators<TValidatable extends IValidatable, TItem>(validatable: TValidatable, item: TItem, collection: readonly TItem[], validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | undefined)[]): void {
    let index = 0;
    let error = undefined;
    while (index < validators.length && error === undefined) {
        const validator = validators[index];
        if (validator && validator.call && validator.apply)
            error = validator(validatable, item, collection);
        index++;
    }
    validatable.error = error;
}

function isValidatable(potentialValidatable: any): potentialValidatable is IValidatable {
    return potentialValidatable && isBoolean(potentialValidatable.isValid) && isBoolean(potentialValidatable.isInvalid);
}

function isBoolean(potentialBoolean: any): potentialBoolean is boolean {
    return potentialBoolean === true || potentialBoolean === false;
}

function isValidationConfig<TValidatable extends IValidatable & INotifyPropertiesChanged>(potentialConfig: TValidatable | IValidationConfig<TValidatable>): potentialConfig is IValidationConfig<TValidatable> {
    return potentialConfig && !isValidatable(potentialConfig) && isValidatable(potentialConfig.target) && isPropertiesChangedNotifier(potentialConfig.target);
}

function isPropertiesChangedNotifier(potentialPropertiesChangedNotifier: any): potentialPropertiesChangedNotifier is INotifyPropertiesChanged {
    return potentialPropertiesChangedNotifier && potentialPropertiesChangedNotifier.propertiesChanged && isFunction(potentialPropertiesChangedNotifier.propertiesChanged.subscribe) && isFunction(potentialPropertiesChangedNotifier.propertiesChanged.unsubscribe);
}

function isFunction(potentialFunction: any): potentialFunction is Function {
    return potentialFunction && potentialFunction.call && potentialFunction.apply;
}