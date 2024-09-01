import type { INotifySetChanged, ISetChangedEventHandler } from "../../collections";
import type { IEventHandler } from "../../events";
import type { ValidationTriggerSelector } from "./ValidationTriggerSelector";
import { ValidationTrigger } from "./ValidationTrigger";
import { resolveAllValidationTriggers } from "./resolveAllValidationTriggers";

interface IItemValidationTriggers {
    readonly validationTriggerEventHandler: IEventHandler<unknown>;
    readonly validationTriggers: readonly ValidationTrigger[];
}

export interface ISetItemValidationTriggerConfig<TItem> {
    readonly set: INotifySetChanged<TItem> & Iterable<TItem>;
    readonly validationTriggerSelector: ValidationTriggerSelector<TItem>;

    shouldTriggerValidation?(item: TItem): boolean;
}

export class SetItemValidationTrigger<TItem> extends ValidationTrigger<INotifySetChanged<TItem> & Iterable<TItem>> {
    private readonly _validationTriggerSelector: ValidationTriggerSelector<TItem>;
    private readonly _shouldTriggerValidation: (item: TItem) => boolean;
    private readonly _itemValidationTriggersByItem: Map<TItem, IItemValidationTriggers>;
    private readonly _setChangedEventHandler: ISetChangedEventHandler<INotifySetChanged<TItem>, TItem>;

    private static _defaultShouldTriggerValidation<TItem>(item: TItem): boolean {
        return true;
    }

    public constructor({ set, validationTriggerSelector, shouldTriggerValidation = SetItemValidationTrigger._defaultShouldTriggerValidation<TItem> }: ISetItemValidationTriggerConfig<TItem>) {
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

    protected subscribeToTarget(): void {
        Array.from(this.trigger).forEach(this._addItemValidationTriggers, this);
        this.trigger.setChanged.subscribe(this._setChangedEventHandler);
    }

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