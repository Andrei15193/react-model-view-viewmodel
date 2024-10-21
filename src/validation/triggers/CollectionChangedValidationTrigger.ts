import type { ICollectionChange, ICollectionChangedEventHandler, INotifyCollectionChanged } from '../../collections';
import { ValidationTrigger } from './ValidationTrigger';

/**
 * Represents the collection changed validation trigger configuration.
 * @template TItem The type of item the collection contains.
 * @template TCollection The collection type that may trigger validations.
 */
export interface ICollectionChangedValidationTriggerConfig<TItem = unknown, TCollection extends INotifyCollectionChanged<TItem> = INotifyCollectionChanged<TItem>> {
    /**
     * Gets the collection that may trigger a validation.
     */
    readonly collection: TCollection;

    /**
     * Optional, a guard method which controls when a validation should be triggered.
     * @param collection The collection that changed.
     * @param collectionChange The collection change.
     */
    shouldTriggerValidation?(collection: TCollection, collectionChange: ICollectionChange<TItem>): boolean;
}

/**
 * Represents a collection changed validation trigger. Whenever the collection changes a validation may be triggered.
 * @template TItem The type of item the collection contains.
 * @template TCollection The collection type that may trigger validations.
 */
export class CollectionChangedValidationTrigger<TItem = unknown, TCollection extends INotifyCollectionChanged<TItem> = INotifyCollectionChanged<TItem>> extends ValidationTrigger<TCollection> {
    private readonly _collectionChangedEventHandler: ICollectionChangedEventHandler<TCollection, TItem> & {
        _notifyValidationTriggered(): void;
    };

    /**
     * Initializes a new instance of the {@linkcode CollectionChangedValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: ICollectionChangedValidationTriggerConfig<TItem, TCollection>) {
        const { collection, shouldTriggerValidation } = config;
        super(collection);

        this._collectionChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(collection, collectionChange) {
                if (!shouldTriggerValidation || shouldTriggerValidation(collection, collectionChange))
                    this._notifyValidationTriggered();
            }
        }
    }

    /**
     * Subscribes to collection changes.
     */
    protected subscribeToTarget(): void {
        this.trigger.collectionChanged.subscribe(this._collectionChangedEventHandler);
    }

    /**
     * Unsubscribes from collection changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.collectionChanged.unsubscribe(this._collectionChangedEventHandler);
    }
}