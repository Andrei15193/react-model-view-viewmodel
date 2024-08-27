import type { IMapChange, IMapChangedEventHandler, INotifyMapChanged } from '../../collections';
import { ValidationTrigger } from './ValidationTrigger';

export interface IMapChangedValidationTriggerConfig<TKey = unknown, TItem = unknown, TMap extends INotifyMapChanged<TKey, TItem> = INotifyMapChanged<TKey, TItem>> {
    readonly map: TMap;

    shouldTriggerValidation?(map: TMap, mapChange: IMapChange<TKey, TItem>): boolean;
}

export class MapChangedValidationTrigger<TKey = unknown, TItem = unknown, TMap extends INotifyMapChanged<TKey, TItem> = INotifyMapChanged<TKey, TItem>> extends ValidationTrigger<TMap> {
    private readonly _mapChangedEventHandler: IMapChangedEventHandler<TMap, TKey, TItem> & {
        _notifyValidationTriggered(): void;
    };

    public constructor({ map, shouldTriggerValidation }: IMapChangedValidationTriggerConfig<TKey, TItem, TMap>) {
        super(map);

        this._mapChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(map, mapChange) {
                if (!shouldTriggerValidation || shouldTriggerValidation(map, mapChange))
                    this._notifyValidationTriggered();
            }
        }
    }

    public subscribeToTarget(): void {
        this.trigger.mapChanged.subscribe(this._mapChangedEventHandler);
    }

    public unsubscribeFromTarget(): void {
        this.trigger.mapChanged.unsubscribe(this._mapChangedEventHandler);
    }
}