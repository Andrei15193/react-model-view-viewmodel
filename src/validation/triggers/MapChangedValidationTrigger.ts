import type { IMapChange, IMapChangedEventHandler, INotifyMapChanged } from '../../collections';
import { ValidationTrigger } from './ValidationTrigger';

/**
 * Represents the map changed validation trigger configuration.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 * @template TMap The map type that may trigger validations.
 */
export interface IMapChangedValidationTriggerConfig<TKey = unknown, TItem = unknown, TMap extends INotifyMapChanged<TKey, TItem> = INotifyMapChanged<TKey, TItem>> {
    /**
     * Gets the map that may trigger a validaiton.
     */
    readonly map: TMap;

    /**
     * Optional, a guard method which controls when a validaiton should be triggered.
     * @param map The map that changed.
     * @param mapChange The map change.
     */
    shouldTriggerValidation?(map: TMap, mapChange: IMapChange<TKey, TItem>): boolean;
}

/**
 * Represents a map changed validation trigger. Whenever the map changes a validation may be triggered.
 * @template TKey The type of keys the map contains.
 * @template TItem The type of items the map contains.
 * @template TMap The map type that may trigger validations.
 */
export class MapChangedValidationTrigger<TKey = unknown, TItem = unknown, TMap extends INotifyMapChanged<TKey, TItem> = INotifyMapChanged<TKey, TItem>> extends ValidationTrigger<TMap> {
    private readonly _mapChangedEventHandler: IMapChangedEventHandler<TMap, TKey, TItem> & {
        _notifyValidationTriggered(): void;
    };

    /**
     * Initializes a new instance of the {@linkcode MapChangedValidationTrigger} class.
     * @param config The validation trigger config.
     */
    public constructor(config: IMapChangedValidationTriggerConfig<TKey, TItem, TMap>) {
        const { map, shouldTriggerValidation } = config;
        super(map);

        this._mapChangedEventHandler = {
            _notifyValidationTriggered: this.notifyValidationTriggered.bind(this),

            handle(map, mapChange) {
                if (!shouldTriggerValidation || shouldTriggerValidation(map, mapChange))
                    this._notifyValidationTriggered();
            }
        }
    }

    /**
     * Subscribes to map changes.
     */
    protected subscribeToTarget(): void {
        this.trigger.mapChanged.subscribe(this._mapChangedEventHandler);
    }

    /**
     * Unsubscribes from map changes.
     */
    protected unsubscribeFromTarget(): void {
        this.trigger.mapChanged.unsubscribe(this._mapChangedEventHandler);
    }
}