import type { IMapChangedEventHandler, INotifyMapChanged } from '../../collections';
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
 * Represents the map item validation trigger configuration.
 */
export interface IMapItemValidationTriggerConfig<TKey, TItem> {
    /**
     * Gets the map containing the items that may trigger validaiton.
     */
    readonly map: INotifyMapChanged<TKey, TItem> & Iterable<[TKey, TItem]>;
    /**
     * Gets the selector that provides the individual validation triggers for each item.
     */
    readonly validationTriggerSelector: ValidationTriggerSelector<TItem>;

    /**
     * Optional, a guard method which controls when a validaiton should be triggered.
     * @param item The item that changed which may trigger a validation.
     */
    shouldTriggerValidation?(item: TItem): boolean;
}

/**
 * Represents a map item validation trigger. Instead of triggering a validaiton only when the map changes,
 * a validaiton may be triggered by any of the contained items when they themselves change.
 * 
 * This is useful when within the collection there is a field that needs to be unique,
 * such as a unique name for each item in the collection.
 */
export class MapItemValidationTrigger<TKey, TItem> extends ValidationTrigger<INotifyMapChanged<TKey, TItem> & Iterable<[TKey, TItem]>> {
    private readonly _validationTriggerSelector: ValidationTriggerSelector<TItem>;
    private readonly _shouldTriggerValidation: (item: TItem) => boolean;
    private readonly _itemValidationTriggersByItem: Map<TItem, IItemValidationTriggers>;
    private readonly _maChangedEventHandler: IMapChangedEventHandler<INotifyMapChanged<TKey, TItem>, TKey, TItem>;

    private static _defaultShouldTriggerValidation<TItem>(item: TItem): boolean {
        return true;
    }

    /**
     * Initializes a new instance of the {@linkcode MapItemValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: IMapItemValidationTriggerConfig<TKey, TItem>) {
        const { map, validationTriggerSelector, shouldTriggerValidation = MapItemValidationTrigger._defaultShouldTriggerValidation<TItem> } = config;
        super(map);

        this._validationTriggerSelector = validationTriggerSelector;
        this._shouldTriggerValidation = shouldTriggerValidation;

        this._itemValidationTriggersByItem = new Map<TItem, IItemValidationTriggers>();
        this._maChangedEventHandler = {
            handle: (_, { addedEntries, removedEntries }) => {
                addedEntries.forEach(([, addedItem]) => this._ensureItemValidationTriggers(addedItem));

                removedEntries.forEach(([, removedItem]) => {
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
     * Subscribes to map and item changes.
     */
    protected subscribeToTarget(): void {
        Array.from(this.trigger).forEach(([, item]) => this._ensureItemValidationTriggers(item));
        this.trigger.mapChanged.subscribe(this._maChangedEventHandler);
    }

    /**
     * Unsubscribes from map and item changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.mapChanged.unsubscribe(this._maChangedEventHandler);

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