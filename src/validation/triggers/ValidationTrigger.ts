import type { INotifyPropertiesChanged } from '../../viewModels';
import type { INotifyCollectionChanged, INotifyCollectionReordered, INotifySetChanged, INotifyMapChanged } from '../../collections';
import { type IEvent, EventDispatcher } from '../../events';

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

export abstract class ValidationTrigger<TTrigger = unknown> {
    private readonly _validationTriggeredEventDispatcher: EventDispatcher<this>;

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

    public readonly trigger: TTrigger;
    public readonly validationTriggered: IEvent<this>;

    protected abstract subscribeToTarget(): void;

    protected abstract unsubscribeFromTarget(): void;

    protected notifyValidationTriggered(): void {
        this._validationTriggeredEventDispatcher.dispatch(this);
    }
}
