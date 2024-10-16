import type { INotifyPropertiesChanged } from '../../viewModels';
import type { INotifyCollectionChanged, INotifyCollectionReordered, INotifySetChanged, INotifyMapChanged } from '../../collections';
import { type IEvent, EventDispatcher } from '../../events';

/**
 * Represent a set of well-known validaiton triggers. These are used to simplify
 * object validator configurations as a view model or observable collection can
 * be directly passed as a trigger.
 *
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the collection, set, or map contains.
 */
export type WellKnownValidationTrigger<TKey = unknown, TItem = unknown>
    = INotifyPropertiesChanged
    | INotifyCollectionChanged<unknown>
    | INotifyCollectionReordered<unknown>
    | INotifySetChanged<unknown>
    | INotifyMapChanged<unknown, unknown>
    | [
        INotifyMapChanged<TKey, TItem> & Iterable<[TKey, TItem]>,
        (item: TItem) => readonly (WellKnownValidationTrigger | ValidationTrigger)[]
    ]
    | [
        (INotifyCollectionChanged<TItem> | INotifySetChanged<TItem>) & Iterable<TItem>,
        (item: TItem) => readonly (WellKnownValidationTrigger | ValidationTrigger)[]
    ]

/**
 * Represents a validation trigger. Generally, they wrap an observable object and whenever
 * it changes the {@linkcode validationTriggered} event is raised.
 *
 * @template TTrigger The concrete type that may trigger validations.
 */
export abstract class ValidationTrigger<TTrigger = unknown> {
    private readonly _validationTriggeredEventDispatcher: EventDispatcher<this>;

    /**
     * Initializes a new instance of the {@linkcode ValidationTrigger} class.
     * @param trigger The source object that triggers validation.
     */
    protected constructor(trigger: TTrigger) {
        this.trigger = trigger;

        let addCount = 0;
        this._validationTriggeredEventDispatcher = new EventDispatcher<this>();
        this.validationTriggered = {
            subscribe: eventHandler => {
                addCount++;
                if (addCount === 1)
                    this.subscribeToTarget();

                this._validationTriggeredEventDispatcher.subscribe(eventHandler);
            },

            unsubscribe: eventHandler => {
                this._validationTriggeredEventDispatcher.unsubscribe(eventHandler);

                addCount--;
                if (addCount === 0)
                    this.unsubscribeFromTarget();
            }
        };
    }

    /**
     * Gets the source object that triggers validation.
     */
    public readonly trigger: TTrigger;
    /**
     * Gets an event that is raised whenever the source object triggers a validation.
     */
    public readonly validationTriggered: IEvent<this>;

    /**
     * A plug-in method that handles the actual event subscription to the {@linkcode trigger}.
     */
    protected abstract subscribeToTarget(): void;

    /**
     * A plug-in method that handles the actual event unsubscription to the {@linkcode trigger}.
     */
    protected abstract unsubscribeFromTarget(): void;

    /**
     * Raises the {@linkcode validationTriggered} event, notifying that a validation should occur.
     */
    protected notifyValidationTriggered(): void {
        this._validationTriggeredEventDispatcher.dispatch(this);
    }
}
