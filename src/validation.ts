import type { IEventHandler, INotifyPropertiesChanged } from "./events";

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

/** A validation callback signature.
 * @param validatable - The object being validated.
*/
export type ValidatorCallback<TValidatable extends IValidatable> = (validatable: TValidatable) => string | undefined;

/** A signature for callbacks that unregister event subscriptions. */
export type UnsubscribeCallback = () => void;

/** Registers and applies the provided validators returning a cleanup callback.
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable a new validation is carried out.
 * @param validatableOrConfig - The object that will be validated by the provided validators.
 * @param validators - The callback validators that handle validation.
*/
export function registerValidators<TValidatable extends IValidatable & INotifyPropertiesChanged>(validatable: TValidatable, ...validators: readonly (ValidatorCallback<TValidatable> | any)[]): UnsubscribeCallback;/** Registers and applies the provided validators returning a cleanup callback.

/** Registers and applies the provided validators returning a cleanup callback.
* The validators are applied one after the other until the first one returns an error message (a value different from undefined).
* Whenever a property has changed (except for error, isValid and isInvalid) on the validatable a new validation is carried out.
* @param validatableOrConfig - The object that will be validated by the provided validators.
* @param validators - The callback validators that handle validation.
*/
export function registerValidators<TValidatable extends IValidatable & INotifyPropertiesChanged>(validatableConfig: IValidationConfig<TValidatable>, ...validators: readonly (ValidatorCallback<TValidatable> | any)[]): UnsubscribeCallback;

/** Registers and applies the provided validators returning a cleanup callback.
 * The validators are applies one after the other until the first one returns an error message (a value different from undefined).
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable a new validation is carried out.
 * @param validatableOrConfig - The object that will be validated by the provided validators.
 * @param validators - The callback validators that handle validation.
 * @returns Returns a callback that unsubscribes all event handlers, a cleanup callback.
*/
export function registerValidators<TValidatable extends IValidatable & INotifyPropertiesChanged>(validatableOrConfig: TValidatable | IValidationConfig<TValidatable>, ...validators: readonly (ValidatorCallback<TValidatable> | any)[]): UnsubscribeCallback {
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