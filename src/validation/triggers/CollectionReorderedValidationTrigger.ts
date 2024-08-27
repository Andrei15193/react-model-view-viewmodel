import type { ICollectionReorder, ICollectionReorderedEventHandler, INotifyCollectionReordered } from "../../collections";
import { ValidationTrigger } from "./ValidationTrigger";

export interface ICollectionReorderedValidationTriggerConfig<TItem = unknown, TCollection extends INotifyCollectionReordered<TItem> = INotifyCollectionReordered<TItem>> {
    readonly collection: TCollection;

    shouldTriggerValidation?(collection: TCollection, collectionReorder: ICollectionReorder<TItem>): boolean;
}

export class CollectionReorderedValidationTrigger<TItem = unknown, TCollection extends INotifyCollectionReordered<TItem> = INotifyCollectionReordered<TItem>> extends ValidationTrigger<TCollection> {
    private readonly _collectionReorderedEventHandler: ICollectionReorderedEventHandler<TCollection, TItem> & {
        _notifyValidationTriggered(): void;
    };

    public constructor({ collection, shouldTriggerValidation }: ICollectionReorderedValidationTriggerConfig<TItem, TCollection>) {
        super(collection);

        this._collectionReorderedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(collection, collectionReorder) {
                if (!shouldTriggerValidation || shouldTriggerValidation(collection, collectionReorder))
                    this._notifyValidationTriggered();
            }
        }
    }

    public subscribeToTarget(): void {
        this.trigger.collectionReordered.subscribe(this._collectionReorderedEventHandler);
    }

    public unsubscribeFromTarget(): void {
        this.trigger.collectionReordered.unsubscribe(this._collectionReorderedEventHandler);
    }
}