import type { IPropertiesChangedEvent } from './IPropertiesChangedEvent';

/**
 * A core interface for objects that notify subscribers when their properties have changed. Components can react to this and display the new value as a consequence.
 */
export interface INotifyPropertiesChanged {
    /**
     * An event that is raised when one or more properties may have changed.
     */
    readonly propertiesChanged: IPropertiesChangedEvent<this>;
}