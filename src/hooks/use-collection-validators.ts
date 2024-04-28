import type { INotifyPropertiesChanged } from '../events';
import type { IReadOnlyObservableCollection } from '../IReadOnlyObservableCollection';
import type { IValidatable, ValidatableSelectorCallback, ValidationConfigSelectorCallback, CollectionItemValidatorCallback } from '../validation';
import { registerCollectionValidators } from '../validation';
import { useEffect } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Registers and applies the provided validators to each item. The collection and validators are part of the dependencies.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed on the entire collection. Each item is revalidated, this is useful when items must have a unique value.
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validatable from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
*/
export function useCollectionValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatableViewModel>, validators: readonly (CollectionItemValidatorCallback<TValidatableViewModel, TItem> | undefined)[]): void;

/** Registers and applies the provided validators to each item. The collection and validators are part of the dependencies.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed on the entire collection. Each item is revalidated, this is useful when items must have a unique value.
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validation config from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
*/
export function useCollectionValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidationConfigSelectorCallback<TItem, TValidatableViewModel>, validators: readonly (CollectionItemValidatorCallback<TValidatableViewModel, TItem> | undefined)[]): void;

/** Registers and applies the provided validators to each item. The collection and validators are part of the dependencies.
 * 
 * The validators are applied one after the other until the first one returns an error message (a value different from undefined).
 * 
 * Whenever a property has changed (except for error, isValid and isInvalid) on the validatable, a new validation is performed on the entire collection. Each item is revalidated, this is useful when items must have a unique value.
 * @template TItem The type of object the collection contains.
 * @template TValidatableViewModel The type of validatable objects that are registered for validation.
 * @param collection The collection to watch, validators are registered for each item. When the collection changes all subscriptions and unsubscriptions are done accordingly.
 * @param selector A callback that selects a validatable or validation config from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators The callback validators that handle validation for each item.
*/
export function useCollectionValidators<TItem, TValidatableViewModel extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatableViewModel> | ValidationConfigSelectorCallback<TItem, TValidatableViewModel>, validators: readonly CollectionItemValidatorCallback<TValidatableViewModel, TItem>[]): void {
    useEffect(
        (): EffectResult => registerCollectionValidators(collection, selector as any, validators),
        [collection, ...validators]
    );
}