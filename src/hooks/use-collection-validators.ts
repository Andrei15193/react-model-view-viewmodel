import type { INotifyPropertiesChanged } from '../events';
import type { IReadOnlyObservableCollection } from '../observable-collection';
import type { IValidatable, ValidatableSelectorCallback, ValidationConfigSelectorCallback, CollectionItemValidatorCallback } from '../validation';
import { registerCollectionValidators } from '../validation';
import { useEffect } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Registers and applies the provided validators to each item. The collection and validators are part of the dependencies.
 * When one item changes the entire collection is revalidated, this is useful when items must have a unique value.
 * @param collection - The collection to watch, validators are registered for each item. When the collection changes all subscription and unsubscriptions are done accordingly.
 * @param selector - A callback that selects a validatable from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators - The callback validators that handle validation for each item.
*/
export function useCollectionValidators<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatable>, validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | undefined)[]): void;

/** Registers and applies the provided validators to each item. The collection and validators are part of the dependencies.
 * When one item changes the entire collection is revalidated, this is useful when items must have a unique value.
 * @param collection - The collection to watch, validators are registered for each item. When the collection changes all subscription and unsubscriptions are done accordingly.
 * @param selector - A callback that selects a validation config from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators - The callback validators that handle validation for each item.
*/
export function useCollectionValidators<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidationConfigSelectorCallback<TItem, TValidatable>, validators: readonly (CollectionItemValidatorCallback<TValidatable, TItem> | undefined)[]): void;

/** Registers and applies the provided validators to each item. The collection and validators are part of the dependencies.
 * When one item changes the entire collection is revalidated, this is useful when items must have a unique value.
 * @param collection - The collection to watch, validators are registered for each item. When the collection changes all subscription and unsubscriptions are done accordingly.
 * @param selector - A callback that selects a validatable or validation config from each item. The returned validatable or target and triggers must be the same for each item in particular in order to properly unsubscribe the event handlers.
 * @param validators - The callback validators that handle validation for each item.
*/
export function useCollectionValidators<TItem, TValidatable extends IValidatable & INotifyPropertiesChanged>(collection: IReadOnlyObservableCollection<TItem>, selector: ValidatableSelectorCallback<TItem, TValidatable> | ValidationConfigSelectorCallback<TItem, TValidatable>, validators: readonly CollectionItemValidatorCallback<TValidatable, TItem>[]): void {
    useEffect(
        (): EffectResult => registerCollectionValidators(collection, selector as any, validators),
        [collection, ...validators]
    );
}