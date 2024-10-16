import type { ISetChange, ISetChangedEventHandler, INotifySetChanged } from '../../collections';
import { ValidationTrigger } from './ValidationTrigger';

/**
 * Represents the set changed validation trigger configuration.
 * @template TItem The type of items the set contains.
 * @template TSet The set type that may trigger validations.
 */
export interface ISetChangedValidationTriggerConfig<TItem = unknown, TSet extends INotifySetChanged<TItem> = INotifySetChanged<TItem>> {
    /**
     * Gets the set that may trigger a validaiton.
     */
    readonly set: TSet;

    /**
     * Optional, a guard method which controls when a validaiton should be triggered.
     * @param set The set that changed.
     * @param setChange The set change.
     */
    shouldTriggerValidation?(set: TSet, setChange: ISetChange<TItem>): boolean;
}

/**
 * Represents a set changed validation trigger. Whenever the set changes a validation may be triggered.
 * @template TItem The type of items the set contains.
 * @template TSet The set type that may trigger validations.
 */
export class SetChangedValidationTrigger<TItem = unknown, TSet extends INotifySetChanged<TItem> = INotifySetChanged<TItem>> extends ValidationTrigger<TSet> {
    private readonly _setChangedEventHandler: ISetChangedEventHandler<TSet, TItem> & {
        _notifyValidationTriggered(): void;
    };

    /**
     * Initializes a new instance of the {@linkcode SetChangedValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: ISetChangedValidationTriggerConfig<TItem, TSet>) {
        const { set, shouldTriggerValidation } = config;
        super(set);

        this._setChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(set, setChange) {
                if (!shouldTriggerValidation || shouldTriggerValidation(set, setChange))
                    this._notifyValidationTriggered();
            }
        }
    }

    /**
     * Subscribes to set changes.
     */
    protected subscribeToTarget(): void {
        this.trigger.setChanged.subscribe(this._setChangedEventHandler);
    }

    /**
     * Unsubscribes from set changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.setChanged.unsubscribe(this._setChangedEventHandler);
    }
}