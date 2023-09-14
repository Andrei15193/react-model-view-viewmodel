import type { IEvent, INotifyPropertiesChanged } from './events';
import { EventDispatcher } from './events';

/**
 * Checkes whether the provided instance is a view model (implements {@link INotifyPropertiesChanged}).
 * @template TViewModel The type of view model to check, defaults to {@link INotifyPropertiesChanged}.
 * @param maybeViewModel The value to check if is a view model.
 * @returns Returns `true` if the provided instance implements {@link INotifyPropertiesChanged}; otherwise `false`.
 */
export function isViewModel<TViewModel extends INotifyPropertiesChanged = INotifyPropertiesChanged>(maybeViewModel: any): maybeViewModel is TViewModel {
    return maybeViewModel !== undefined && maybeViewModel !== null && !(maybeViewModel instanceof Function) && 'propertiesChanged' in maybeViewModel;
}

/** Represents a base view model class providing core features. */
export abstract class ViewModel implements INotifyPropertiesChanged {
    private readonly _propertiesChangedEvent: EventDispatcher<readonly string[]> = new EventDispatcher<readonly string[]>();

    /** Initializes a new instance of the ViewModel class. */
    public constructor() {
    }

    /** An event that is raised when one or more properties may have changed. */
    public get propertiesChanged(): IEvent<readonly string[]> {
        return this._propertiesChangedEvent;
    }

    /** Notifies all propertiesChanged subscribers that the provided property names may have changed. 
     * @param changedProperty The name of the property that may have changed.
     * @param otherChangedProperties The name of other properties that may have changed.
     */
    protected notifyPropertiesChanged(changedProperty: string, ...otherChangedProperties: readonly string[]): void {
        this._propertiesChangedEvent.dispatch(this, [changedProperty, ...otherChangedProperties]);
    }
}