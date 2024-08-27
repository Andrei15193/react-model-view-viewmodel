import type { ICollectionChange, ICollectionChangedEventHandler, INotifyCollectionChanged } from "../../collections";
import { ValidationTrigger } from "./ValidationTrigger";

export interface ICollectionChangedValidationTriggerConfig<TItem = unknown, TCollection extends INotifyCollectionChanged<TItem> = INotifyCollectionChanged<TItem>> {
    readonly collection: TCollection;

    shouldTriggerValidation?(collection: TCollection, collectionChange: ICollectionChange<TItem>): boolean;
}

export class CollectionChangedValidationTrigger<TItem = unknown, TCollection extends INotifyCollectionChanged<TItem> = INotifyCollectionChanged<TItem>> extends ValidationTrigger<TCollection> {
    private readonly _collectionChangedEventHandler: ICollectionChangedEventHandler<TCollection, TItem> & {
        _notifyValidationTriggered(): void;
    };

    public constructor({ collection, shouldTriggerValidation }: ICollectionChangedValidationTriggerConfig<TItem, TCollection>) {
        super(collection);

        this._collectionChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(collection, collectionChange) {
                if (!shouldTriggerValidation || shouldTriggerValidation(collection, collectionChange))
                    this._notifyValidationTriggered();
            }
        }
    }

    public subscribeToTarget(): void {
        this.trigger.collectionChanged.subscribe(this._collectionChangedEventHandler);
    }

    public unsubscribeFromTarget(): void {
        this.trigger.collectionChanged.unsubscribe(this._collectionChangedEventHandler);
    }
}