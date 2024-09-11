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

export interface ICollectionItemValidationTriggerConfig<TItem> {
    readonly collection: INotifyCollectionChanged<TItem> & Iterable<TItem>;
    readonly validationTriggerSelector: ValidationTriggerSelector<TItem>;

    shouldTriggerValidation?(item: TItem): boolean;
}

export class CollectionItemValidationTrigger<TItem> extends ValidationTrigger<INotifyCollectionChanged<TItem> & Iterable<TItem>> {
    private readonly _validationTriggerSelector: ValidationTriggerSelector<TItem>;
    private readonly _shouldTriggerValidation: (item: TItem) => boolean;
    private readonly _itemValidationTriggersByItem: Map<TItem, IItemValidationTriggers>;
    private readonly _collectionChangedEventHandler: ICollectionChangedEventHandler<INotifyCollectionChanged<TItem>, TItem>;

    private static _defaultShouldTriggerValidation<TItem>(item: TItem): boolean {
        return true;
    }

    public constructor({ collection, validationTriggerSelector, shouldTriggerValidation = CollectionItemValidationTrigger._defaultShouldTriggerValidation<TItem> }: ICollectionItemValidationTriggerConfig<TItem>) {
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

    protected subscribeToTarget(): void {
        Array.from(this.trigger).forEach(this._ensureItemValidationTriggers, this);
        this.trigger.collectionChanged.subscribe(this._collectionChangedEventHandler);
    }

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