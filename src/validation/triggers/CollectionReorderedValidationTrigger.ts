import type { ICollectionReorder, ICollectionReorderedEventHandler, INotifyCollectionReordered } from '../../collections';
import { ValidationTrigger } from './ValidationTrigger';

/**
 * Represents the collection reordered validation trigger configuration.
 * @template TItem The type of item the collection contains.
 * @template TCollection The collection type that may trigger validations.
 */
export interface ICollectionReorderedValidationTriggerConfig<TItem = unknown, TCollection extends INotifyCollectionReordered<TItem> = INotifyCollectionReordered<TItem>> {
    /**
     * Gets the collection that may trigger a validation.
     */
    readonly collection: TCollection;

    /**
     * Optional, a guard method which controls when a validation should be triggered.
     * @param collection The collection that changed.
     * @param collectionReorder The collection reorder information.
     */
    shouldTriggerValidation?(collection: TCollection, collectionReorder: ICollectionReorder<TItem>): boolean;
}

/**
 * Represents a collection reordered validation trigger. Whenever the collection reorders a validation may be triggered.
 * @template TItem The type of item the collection contains.
 * @template TCollection The collection type that may trigger validations.
 */
export class CollectionReorderedValidationTrigger<TItem = unknown, TCollection extends INotifyCollectionReordered<TItem> = INotifyCollectionReordered<TItem>> extends ValidationTrigger<TCollection> {
    private readonly _collectionReorderedEventHandler: ICollectionReorderedEventHandler<TCollection, TItem> & {
        _notifyValidationTriggered(): void;
    };

    /**
     * Initializes a new instance of the {@linkcode CollectionReorderedValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: ICollectionReorderedValidationTriggerConfig<TItem, TCollection>) {
        const { collection, shouldTriggerValidation } = config;
        super(collection);

        this._collectionReorderedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(collection, collectionReorder) {
                if (!shouldTriggerValidation || shouldTriggerValidation(collection, collectionReorder))
                    this._notifyValidationTriggered();
            }
        }
    }

    /**
     * Subscribes to collection reordering.
     */
    protected subscribeToTarget(): void {
        this.trigger.collectionReordered.subscribe(this._collectionReorderedEventHandler);
    }

    /**
     * Unsubscribes from collection reordering.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.collectionReordered.unsubscribe(this._collectionReorderedEventHandler);
    }
}