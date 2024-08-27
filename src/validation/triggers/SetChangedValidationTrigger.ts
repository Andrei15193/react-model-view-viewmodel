import type { ISetChange, ISetChangedEventHandler, INotifySetChanged } from '../../collections';
import { ValidationTrigger } from './ValidationTrigger';

export interface ISetChangedValidationTriggerConfig<TItem = unknown, TSet extends INotifySetChanged<TItem> = INotifySetChanged<TItem>> {
    readonly set: TSet;

    shouldTriggerValidation?(set: TSet, setChange: ISetChange<TItem>): boolean;
}

export class SetChangedValidationTrigger<TItem = unknown, TSet extends INotifySetChanged<TItem> = INotifySetChanged<TItem>> extends ValidationTrigger<TSet> {
    private readonly _setChangedEventHandler: ISetChangedEventHandler<TSet, TItem> & {
        _notifyValidationTriggered(): void;
    };

    public constructor({ set, shouldTriggerValidation }: ISetChangedValidationTriggerConfig<TItem, TSet>) {
        super(set);

        this._setChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(set, setChange) {
                if (!shouldTriggerValidation || shouldTriggerValidation(set, setChange))
                    this._notifyValidationTriggered();
            }
        }
    }

    public subscribeToTarget(): void {
        this.trigger.setChanged.subscribe(this._setChangedEventHandler);
    }

    public unsubscribeFromTarget(): void {
        this.trigger.setChanged.unsubscribe(this._setChangedEventHandler);
    }
}