import type { INotifyPropertiesChanged } from './INotifyPropertiesChanged';
import type { IPropertiesChangedEvent } from './IPropertiesChangedEvent';
import { EventDispatcher } from '../events';

/**
 * Represents a base view model class providing core features.
 */
export abstract class ViewModel implements INotifyPropertiesChanged {
    private readonly _propertiesChangedEvent: EventDispatcher<this, readonly (keyof this)[]> = new EventDispatcher<this, readonly (keyof this)[]>();

    /**
     * Initializes a new instance of the {@linkcode ViewModel} class.
     */
    public constructor() {
    }

    /**
     * An event that is raised when one or more properties may have changed.
     */
    public get propertiesChanged(): IPropertiesChangedEvent<this> {
        return this._propertiesChangedEvent;
    }

    /**
     * Notifies all observers that the provided properties may have changed.
     * @param changedProperty The name of the property that may have changed.
     * @param otherChangedProperties The name of other properties that may have changed.
     */
    protected notifyPropertiesChanged(changedProperty: keyof this, ...otherChangedProperties: readonly (keyof this)[]): void {
        this._propertiesChangedEvent.dispatch(this, [changedProperty, ...otherChangedProperties]);
    }
}