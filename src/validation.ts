import type { INotifyPropertiesChanged, IPropertiesChangedEventHandler, ICollectionChangedEventHandler } from './events';
import type { IReadOnlyObservableCollection } from './observable-collection';

/** Represents a read-only interface for objects that can be validated. */
export interface IReadOnlyValidatable {
    /** A flag indicating whether the field is valid. Generally, when there is no associated error message. */
    readonly isValid: boolean;

    /** A flag indicating whether the field is invalid. Generally, when there is an associated error message. */
    readonly isInvalid: boolean;

    /** An error message (or translation key) providing information as to why the field is invalid. */
    readonly error: string | undefined;
}

/** Represents an interface for objects that can be validated. */
export interface IValidatable extends IReadOnlyValidatable {
    /** An error message (or translation key) providing information as to why the field is invalid. */
    error: string | undefined;
}

/** Represents a validation config covering scenarios where one object may depend on other objects to determine their valid state.
 * @template TValidatableViewModel The type of validatable objects that is being configured.
 */
export interface IValidationConfig<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged> {
    /** The object that is being validated. */
    readonly target: TValidatableViewModel;
    /** Additional validation triggers, if the target or any of the triggers notify of properties changing then a validation is done on the target. */
    readonly triggers?: readonly INotifyPropertiesChanged[];
    /** A collection of property names to watch for. The validation is carried out only if the specified properties have changed.
     * These come in addition to the filters that is placed on the target. The target is not validated when its error, isValid and isInvalid properties change.
     */
    readonly watchedProperties?: readonly PropertyKey[];
}

/** Represents a validator callback.
 * @template T The type of validatable objects to validate.
 * @param validatable The object being validated.
 */
export type ValidatorCallback<T> = (validatable: T) => string | undefined;

/** Represents a collection bound validator callback.
 * @template TValidatable The type of validatable objects to validate.
 * @template TItem The type of items the collection contains.
 * @param validatable The object being validated.
 * @param item The item from which the validatable has been selected.
 * @param collection The collection to which the item belongs.
 */
export type CollectionItemValidatorCallback<TValidatable extends IReadOnlyValidatable, TItem> = (validatable: TValidatable, item: TItem, collection: Iterable<TItem>) => string | undefined;

/** Represents a validatable selector callback.
 * @template TItem The type of items from which to select validatable objects.
 * @template TValidatableViewModel The type of validatable objects that are selected from an item.
 * @param source The item from which a validatable is selected.
 */
export type ValidatableSelectorCallback<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged> = (source: TItem) => TValidatableViewModel;

/** Represents a validation config selector callback.
 * @template TItem The type of items from which to select validatable objects.
 * @template TValidatableViewModel The type of validatable objects that are selected from an item as part of the validation config.
 * @param source The item from which a validation config is selected.
 */
export type ValidationConfigSelectorCallback<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged> = (source: TItem) => IValidationConfig<TValidatableViewModel>;

/** Represents a clean-up callback that unsubscribes event handlers that perform validation. */
export type UnsubscribeCallback = () => void;

/** Registers and applies the provided validators returning a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param validatable The object that will be validated by the provided validators.
 * @param validators The callback validators that handle validation.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerValidators<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(validatable: TValidatableViewModel, validators: readonly ValidatorCallback<TValidatableViewModel>[]): UnsubscribeCallback;

/** Registers and applies the provided validators returning a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param validationConfig The config for setting up validation.
 * @param validators The callback validators that handle validation.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerValidators<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(validationConfig: IValidationConfig<TValidatableViewModel>, validators: readonly ValidatorCallback<TValidatableViewModel>[]): UnsubscribeCallback;

/** Registers and applies the provided validators returning a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param validatableOrConfig The object that will be validated by the provided validators or the config for setting up validation.
 * @param validators The callback validators that handle validation.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerValidators<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(validatableOrConfig: TValidatableViewModel | IValidationConfig<TValidatableViewModel>, validators: readonly ValidatorCallback<TValidatableViewModel>[]): UnsubscribeCallback {
    let target: TValidatableViewModel;
    let triggers: readonly INotifyPropertiesChanged[] | undefined = undefined;
    let watchedProperties: readonly PropertyKey[] | undefined = undefined;
    if (isValidationConfig(validatableOrConfig)) {
        target = validatableOrConfig.target;
        triggers = validatableOrConfig.triggers;
        watchedProperties = validatableOrConfig.watchedProperties;
    }
    else
        target = validatableOrConfig;

    const validatableChangedEventHandler: IPropertiesChangedEventHandler<IValidatable & INotifyPropertiesChanged> = {
        handle(_, changedProperties): void {
            if (changedProperties.some(changedProperty => changedProperty !== 'error' && changedProperty !== 'isValid' && changedProperty !== 'isInvalid')
                && (watchedProperties === undefined || containsAny(changedProperties, watchedProperties)))
                applyValidators(target, validators);
        }
    };
    const triggerChangedEventHandler: IPropertiesChangedEventHandler<INotifyPropertiesChanged> = {
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

/** Registers and applies the provided validators to each item and returns a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed on the entire collection. Each item is revalidated, this is useful when items must have a unique value.
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validatable from each item. The returned value must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerCollectionValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): UnsubscribeCallback;

/** Registers and applies the provided validators to each item and returns a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed on the entire collection. Each item is revalidated, this is useful when items must have a unique value.
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validation config from each item. The returned target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
*/
export function registerCollectionValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidationConfigSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): UnsubscribeCallback;

/** Registers and applies the provided validators to each item and returns a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed on the entire collection. Each item is revalidated, this is useful when items must have a unique value.
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validatable or validation config from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerCollectionValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatableViewModel> | ValidationConfigSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): UnsubscribeCallback {
    const validatableChangedEventHandler: IPropertiesChangedEventHandler<IValidatable> = {
        handle(_, changedProperties): void {
            if (changedProperties.some(changedProperty => changedProperty !== 'error' && changedProperty !== 'isValid' && changedProperty !== 'isInvalid'))
                validateItems(changedProperties);
        }
    };
    const triggerChangedEventHandler: IPropertiesChangedEventHandler<TValidatableViewModel> = {
        handle(_, changedProperties): void {
            validateItems(changedProperties);
        }
    };
    const collectionChangedEventHandler: ICollectionChangedEventHandler<IReadOnlyObservableCollection<TItem>, TItem> = {
        handle(_, collectionChange): void {
            collectionChange.removedItems && collectionChange.removedItems.forEach(unwatchItem);
            collectionChange.addedItems && collectionChange.addedItems.forEach(watchItem);
            validateItems();
        }
    };

    collection.forEach(watchItem);
    validateItems();
    collection.collectionChanged.subscribe(collectionChangedEventHandler);

    return () => {
        collection.collectionChanged.unsubscribe(collectionChangedEventHandler);
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
                const validatable: TValidatableViewModel = validatableOrConfig;
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
                const validatable: TValidatableViewModel = validatableOrConfig;
                validatable.propertiesChanged.unsubscribe(validatableChangedEventHandler);
            }
        }
    }

    function validateItems(changedProperties?: readonly (keyof TValidatableViewModel)[]): void {
        collection.forEach((item, _) => {
            const validatableOrConfig = selector(item);
            if (isValidationConfig(validatableOrConfig)) {
                const { target, watchedProperties } = validatableOrConfig;
                if (!changedProperties || !watchedProperties || containsAny(changedProperties, watchedProperties))
                    applyCollectionItemValidators(target, item, collection, validators);
            }
            else {
                const validatable: TValidatableViewModel = validatableOrConfig;
                applyCollectionItemValidators(validatable, item, collection, validators);
            }
        });
    }
}

/** Registers and applies the provided validators to each item and returns a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed just on that item and not the entire collection. This is useful when items have individual validation rules (e.g.: required value).
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validatable from each item. The returned value must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerCollectionItemValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): UnsubscribeCallback;

/** Registers and applies the provided validators to each item and returns a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed just on that item and not the entire collection. This is useful when items have individual validation rules (e.g.: required value).
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validation config from each item. The returned target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerCollectionItemValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidationConfigSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): UnsubscribeCallback;

/** Registers and applies the provided validators to each item and returns a clean-up callback.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed just on that item and not the entire collection. This is useful when items have individual validation rules (e.g.: required value).
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validatable or validation config from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
 * @returns Returns a clean-up callback that unsubscribes all event registrations.
 */
export function registerCollectionItemValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatableViewModel> | ValidationConfigSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): UnsubscribeCallback {
    const validatableChangedEventHandler: IPropertiesChangedEventHandler<IValidatable & INotifyPropertiesChanged> = {
        handle(validatable: TValidatableViewModel, changedProperties): void {
            if (changedProperties.some(changedProperty => changedProperty !== 'error' && changedProperty !== 'isValid' && changedProperty !== 'isInvalid')) {
                collection.forEach(item => {
                    if (item !== undefined && item !== null) {
                        const currentValidatableOrConfig = selector(item);
                        if (isValidationConfig(currentValidatableOrConfig)) {
                            const { target, watchedProperties } = currentValidatableOrConfig;
                            if (target === validatable && (!watchedProperties || containsAny(changedProperties, watchedProperties)))
                                applyCollectionItemValidators(target, item, collection, validators);
                        }
                        else {
                            const currentValidatable: TValidatableViewModel = currentValidatableOrConfig;
                            if (currentValidatable === validatable)
                                applyCollectionItemValidators(currentValidatable, item, collection, validators);
                        }
                    }
                });
            }
        }
    };
    const triggerChangedEventHandler: IPropertiesChangedEventHandler<INotifyPropertiesChanged> = {
        handle(trigger, changedProperties): void {
            collection.forEach(item => {
                if (item !== undefined && item !== null) {
                    const { target, triggers, watchedProperties } = selector(item) as IValidationConfig<TValidatableViewModel>;
                    if (triggers && triggers.indexOf(trigger) >= 0 && (!watchedProperties || containsAny(watchedProperties, changedProperties)))
                        applyCollectionItemValidators(target, item, collection, validators);
                }
            });
        }
    };
    const collectionChangedEventHandler: ICollectionChangedEventHandler<IReadOnlyObservableCollection<TItem>, TItem> = {
        handle(_, collectionChange): void {
            collectionChange.removedItems && collectionChange.removedItems.forEach(unwatchItem);
            collectionChange.addedItems && collectionChange.addedItems.forEach(watchItem);
        }
    };

    collection.forEach(watchItem);
    collection.collectionChanged.subscribe(collectionChangedEventHandler);

    return () => {
        collection.collectionChanged.unsubscribe(collectionChangedEventHandler);
        collection.forEach(unwatchItem);
    };

    function watchItem(item: TItem): void {
        if (item !== undefined && item !== null) {
            const validatableOrConfig = selector(item);
            if (isValidationConfig(validatableOrConfig)) {
                const { target, triggers } = validatableOrConfig;
                target.propertiesChanged.subscribe(validatableChangedEventHandler);
                triggers && triggers.forEach(trigger => trigger.propertiesChanged.subscribe(triggerChangedEventHandler));

                applyCollectionItemValidators(target, item, collection, validators);
            }
            else {
                const validatable: TValidatableViewModel = validatableOrConfig;
                validatable.propertiesChanged.subscribe(validatableChangedEventHandler);
                applyCollectionItemValidators(validatable, item, collection, validators);
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
                const validatable: TValidatableViewModel = validatableOrConfig;
                validatable.propertiesChanged.unsubscribe(validatableChangedEventHandler);
            }
        }
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

function applyCollectionItemValidators<TValidatable extends IValidatable, TItem>(validatable: TValidatable, item: TItem, collection: Iterable<TItem>, validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | undefined)[]): void {
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

function isValidationConfig<TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(potentialConfig: TValidatableViewModel | IValidationConfig<TValidatableViewModel>): potentialConfig is IValidationConfig<TValidatableViewModel> {
    return potentialConfig && !isValidatable(potentialConfig) && isValidatable(potentialConfig.target) && isPropertiesChangedNotifier(potentialConfig.target);
}

function isPropertiesChangedNotifier(potentialPropertiesChangedNotifier: any): potentialPropertiesChangedNotifier is INotifyPropertiesChanged {
    return potentialPropertiesChangedNotifier && potentialPropertiesChangedNotifier.propertiesChanged && isFunction(potentialPropertiesChangedNotifier.propertiesChanged.subscribe) && isFunction(potentialPropertiesChangedNotifier.propertiesChanged.unsubscribe);
}

function isFunction(potentialFunction: any): potentialFunction is Function {
    return potentialFunction && potentialFunction.call && potentialFunction.apply;
}