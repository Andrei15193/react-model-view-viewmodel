import type { INotifyPropertiesChanged } from '../../viewModels';
import type { INotifyCollectionChanged, INotifyCollectionReordered, INotifySetChanged, INotifyMapChanged } from '../../collections';
import { type IEvent, EventDispatcher } from '../../events';

export type WellKnownValidationTrigger
    = INotifyPropertiesChanged
    | INotifyCollectionChanged<unknown>
    | INotifyCollectionReordered<unknown>
    | INotifySetChanged<unknown>
    | INotifyMapChanged<unknown, unknown>;

export class ValidationTrigger<TTrigger = unknown> {
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

    protected subscribeToTarget(): void {
    }

    protected unsubscribeFromTarget(): void {
    }

    protected notifyValidationTriggered(): void {
        this._validationTriggeredEventDispatcher.dispatch(this);
    }
}
