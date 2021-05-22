import type { IEvent, INotifyPropertiesChanged } from './events';
import { DispatchEvent } from './events';

/** Represents a base view model class providing the core features. */
export abstract class ViewModel implements INotifyPropertiesChanged {
    private readonly _propertiesChangedEvent: DispatchEvent<readonly string[]> = new DispatchEvent<readonly string[]>();

    /** Initializes a new instance of the ViewModel class. */
    public constructor() {
    }

    /** An event that is raised when one or more properties may have changed. */
    public get propertiesChanged(): IEvent<readonly string[]> {
        return this._propertiesChangedEvent;
    }

    /** Notifies all propertiesChanged subscribers that the provided property names may have changed. */
    protected notifyPropertiesChanged(changedProperty: string, ...otherChangedProperties: readonly string[]): void {
        this._propertiesChangedEvent.dispatch(this, [changedProperty, ...otherChangedProperties]);
    }
}