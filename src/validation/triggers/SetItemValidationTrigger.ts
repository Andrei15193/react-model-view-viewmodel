import type { INotifySetChanged, ISetChangedEventHandler } from '../../collections';
import type { IEventHandler } from '../../events';
import type { ValidationTriggerSelector } from './ValidationTriggerSelector';
import { ValidationTrigger } from './ValidationTrigger';
import { resolveAllValidationTriggers } from './resolveAllValidationTriggers';

interface IItemValidationTriggers {
    readonly validationTriggerEventHandler: IEventHandler<unknown>;
    readonly validationTriggers: readonly ValidationTrigger[];
}

/**
 * Represents the set item validation trigger configuration.
 * @template TItem The type of items the set contains.
 */
export interface ISetItemValidationTriggerConfig<TItem> {
    /**
     * Gets the set containing the items that may trigger validation.
     */
    readonly set: INotifySetChanged<TItem> & Iterable<TItem>;
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
 * Represents a set item validation trigger. Instead of triggering a validation only when the set changes,
 * a validation may be triggered by any of the contained items when they themselves change.
 *
 * This is useful when within the collection there is a field that needs to be unique,
 * such as a unique name for each item in the collection.
 *
 * @template TItem The type of items the set contains.
 */
export class SetItemValidationTrigger<TItem> extends ValidationTrigger<INotifySetChanged<TItem> & Iterable<TItem>> {
    private readonly _validationTriggerSelector: ValidationTriggerSelector<TItem>;
    private readonly _shouldTriggerValidation: (item: TItem) => boolean;
    private readonly _itemValidationTriggersByItem: Map<TItem, IItemValidationTriggers>;
    private readonly _setChangedEventHandler: ISetChangedEventHandler<INotifySetChanged<TItem>, TItem>;

    private static _defaultShouldTriggerValidation<TItem>(item: TItem): boolean {
        return true;
    }

    /**
     * Initializes a new instance of the {@linkcode SetItemValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: ISetItemValidationTriggerConfig<TItem>) {
        const { set, validationTriggerSelector, shouldTriggerValidation = SetItemValidationTrigger._defaultShouldTriggerValidation<TItem> } = config;
        super(set);

        this._validationTriggerSelector = validationTriggerSelector;
        this._shouldTriggerValidation = shouldTriggerValidation;

        this._itemValidationTriggersByItem = new Map<TItem, IItemValidationTriggers>();
        this._setChangedEventHandler = {
            handle: (_, { addedItems, removedItems }) => {
                addedItems.forEach(this._addItemValidationTriggers, this);

                removedItems.forEach(removedItem => {
                    const itemEventHandler = this._itemValidationTriggersByItem.get(removedItem);
                    if (itemEventHandler !== null && itemEventHandler !== undefined) {
                        itemEventHandler.validationTriggers.forEach(validationTrigger => {
                            validationTrigger.validationTriggered.unsubscribe(itemEventHandler.validationTriggerEventHandler);
                        });
                        this._itemValidationTriggersByItem.delete(removedItem);
                    }
                });

                this.notifyValidationTriggered();
            },
        };
    }

    /**
     * Subscribes to set and item changes.
     */
    protected subscribeToTarget(): void {
        Array.from(this.trigger).forEach(this._addItemValidationTriggers, this);
        this.trigger.setChanged.subscribe(this._setChangedEventHandler);
    }

    /**
     * Unsubscribes from set and item changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.setChanged.unsubscribe(this._setChangedEventHandler);

        this._itemValidationTriggersByItem.forEach(({ validationTriggers, validationTriggerEventHandler }) => {
            validationTriggers.forEach(validationTrigger => {
                validationTrigger.validationTriggered.unsubscribe(validationTriggerEventHandler);
            });
        });
        this._itemValidationTriggersByItem.clear();
    }

    private _addItemValidationTriggers(item: TItem): void {
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
            validationTriggerEventHandler,
            validationTriggers: resolvedValidationTriggers
        });
    }
}