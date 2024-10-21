import type { ICollectionChangedEventHandler, INotifyCollectionChanged } from '../../collections';
import type { IEventHandler } from '../../events';
import type { ValidationTriggerSelector } from './ValidationTriggerSelector';
import { ValidationTrigger } from './ValidationTrigger';
import { resolveAllValidationTriggers } from './resolveAllValidationTriggers';

interface IItemValidationTriggers {
    itemCount: number;
    readonly validationTriggerEventHandler: IEventHandler<unknown>;
    readonly validationTriggers: readonly ValidationTrigger[];
}

/**
 * Represents the collection item validation trigger configuration.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionItemValidationTriggerConfig<TItem> {
    /**
     * Gets the collection containing the items that may trigger validation.
     */
    readonly collection: INotifyCollectionChanged<TItem> & Iterable<TItem>;
    /**
     * Gets the selector that provides the individual validation triggers for each item.
     */
    readonly validationTriggerSelector: ValidationTriggerSelector<TItem>;

    /**
     * Optional, a guard method which controls when a validation should be triggered.
     * @param item The item that changed which may trigger a validation.
     */
    shouldTriggerValidation?(item: TItem): boolean;
}

/**
 * Represents a collection item validation trigger. Instead of triggering a validation only when the collection changes,
 * a validation may be triggered by any of the contained items when they themselves change.
 * 
 * This is useful when within the collection there is a field that needs to be unique,
 * such as a unique name for each item in the collection.
 * 
 * @template TItem The type of items the collection contains.
 */
export class CollectionItemValidationTrigger<TItem> extends ValidationTrigger<INotifyCollectionChanged<TItem> & Iterable<TItem>> {
    private readonly _validationTriggerSelector: ValidationTriggerSelector<TItem>;
    private readonly _shouldTriggerValidation: (item: TItem) => boolean;
    private readonly _itemValidationTriggersByItem: Map<TItem, IItemValidationTriggers>;
    private readonly _collectionChangedEventHandler: ICollectionChangedEventHandler<INotifyCollectionChanged<TItem>, TItem>;

    private static _defaultShouldTriggerValidation<TItem>(item: TItem): boolean {
        return true;
    }

    /**
     * Initializes a new instance of the {@linkcode CollectionItemValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: ICollectionItemValidationTriggerConfig<TItem>) {
        const { collection, validationTriggerSelector, shouldTriggerValidation = CollectionItemValidationTrigger._defaultShouldTriggerValidation<TItem> } = config;
        super(collection);

        this._validationTriggerSelector = validationTriggerSelector;
        this._shouldTriggerValidation = shouldTriggerValidation;

        this._itemValidationTriggersByItem = new Map<TItem, IItemValidationTriggers>();
        this._collectionChangedEventHandler = {
            handle: (_, { addedItems, removedItems }) => {
                addedItems.forEach(this._ensureItemValidationTriggers, this);

                removedItems.forEach(removedItem => {
                    const itemEventHandler = this._itemValidationTriggersByItem.get(removedItem);
                    if (itemEventHandler !== null && itemEventHandler !== undefined) {
                        itemEventHandler.itemCount--;

                        if (itemEventHandler.itemCount === 0) {
                            itemEventHandler.validationTriggers.forEach(validationTrigger => {
                                validationTrigger.validationTriggered.unsubscribe(itemEventHandler.validationTriggerEventHandler);
                            });
                            this._itemValidationTriggersByItem.delete(removedItem);
                        }
                    }
                });

                this.notifyValidationTriggered();
            },
        };
    }

    /**
     * Subscribes to collection and item changes.
     */
    protected subscribeToTarget(): void {
        Array.from(this.trigger).forEach(this._ensureItemValidationTriggers, this);
        this.trigger.collectionChanged.subscribe(this._collectionChangedEventHandler);
    }

    /**
     * Unsubscribes from collection and item changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.collectionChanged.unsubscribe(this._collectionChangedEventHandler);

        this._itemValidationTriggersByItem.forEach(({ validationTriggers, validationTriggerEventHandler }) => {
            validationTriggers.forEach(validationTrigger => {
                validationTrigger.validationTriggered.unsubscribe(validationTriggerEventHandler);
            });
        });
        this._itemValidationTriggersByItem.clear();
    }

    private _ensureItemValidationTriggers(item: TItem): void {
        let itemEventHandler = this._itemValidationTriggersByItem.get(item);
        if (itemEventHandler === null || itemEventHandler === undefined) {
            const validationTriggerEventHandler: IEventHandler<unknown> = {
                handle: () => {
                    if (this._shouldTriggerValidation(item))
                        this.notifyValidationTriggered();
                },
            };

            const resolvedValidationTriggers = resolveAllValidationTriggers(this._validationTriggerSelector(item));
            resolvedValidationTriggers.forEach(validationTrigger => {
                validationTrigger.validationTriggered.subscribe(validationTriggerEventHandler);
            });

            this._itemValidationTriggersByItem.set(item, {
                itemCount: 1,
                validationTriggerEventHandler,
                validationTriggers: resolvedValidationTriggers
            });
        }
        else
            itemEventHandler.itemCount++;
    }
}