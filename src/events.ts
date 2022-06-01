/** Represents an event to which objects can subscribe and unsubscribe from. Similar to an event in .NET.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 */
export interface IEvent<TEventArgs = void> {
    /** Subscribes the given eventHandler to the event.
     * @param eventHandler An event handler that gets notified when the event is raised.
     */
    subscribe(eventHandler: IEventHandler<TEventArgs>): void;

    /** Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler The event handler that was previously subscribed to the event.
     */
    unsubscribe(eventHandler: IEventHandler<TEventArgs>): void;
}

/** An event handler used to subscribe to events. Similar to an EventHandler delegate in .NET.
 * @template TEventArgs Optional, can be used to provide context about the event.
 */
export interface IEventHandler<TEventArgs = void> {
    /** The method that handles the event.
     * @param subject The object that raised the event.
     * @param args A set of arguments that provide context for the event.
     */
    handle(subject: object, args: TEventArgs): void;
}

/** 
 * A base implementation of an event. To avoid misuse, declare a private event of this type and expose it as an IEvent.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 */
export class DispatchEvent<TEventArgs = void> implements IEvent<TEventArgs> {
    private _eventHandlers: readonly IEventHandler<TEventArgs>[] = [];

    /** Subscribes the given eventHandler to the event.
     * @param eventHandler An event handler that gets notified when the event is raised.
     */
    public subscribe(eventHandler: IEventHandler<TEventArgs>): void {
        if (eventHandler !== null && eventHandler !== undefined)
            this._eventHandlers = this._eventHandlers.concat(eventHandler);
    }

    /** Unsubscribes the given eventHandler to the event. The exact same object that was used to subscribe to the event must be passed as well.
     * @param eventHandler The event handler that was previously subscribed to the event.
     */
    public unsubscribe(eventHandler: IEventHandler<TEventArgs>): void {
        const eventHandlerIndex = this._eventHandlers.indexOf(eventHandler);
        if (eventHandlerIndex >= 0)
            this._eventHandlers = this._eventHandlers.filter((_, index) => index !== eventHandlerIndex);
    }

    /** Dispatches a notification to all subscribers.
     * @param subject The object raising the event, generally the object which is exposing it.
     * @param args A set of arguments that provide context for the event.
     */
    public dispatch(subject: object, args: TEventArgs): void {
        this._eventHandlers.forEach(eventHandler => {
            if (this._eventHandlers.indexOf(eventHandler) >= 0)
                eventHandler.handle(subject, args);
        });
    }
}

/** A core interface for objects that notify subscribers when their properties have changed. Components can react to this and display the new value as a consequence. */
export interface INotifyPropertiesChanged {
    /** An event that is raised when one or more properties may have changed. */
    readonly propertiesChanged: IEvent<readonly string[]>;
}

/** A core interface for observable collections. Components can react to this and display the new value as a consequence.
 * @template TItem The type of items the collection contains.
 */
export interface INotifyCollectionChanged<TItem> {
    /** An event that is raised when an item is added to the collection. */
    readonly itemAdded: IEvent<IItemAddedEventArgs<TItem>>;

    /** An event that is raised when an item is removed from the collection. */
    readonly itemRemoved: IEvent<IItemRemovedEventArgs<TItem>>;

    /** An event that is raised when the collection changed. */
    readonly collectionChanged: IEvent<ICollectionChange<TItem>>;
}

/** Contains information about the item that was added to a collection, including the option to subscribe a clean-up callback.
 * @template TItem The type of items the collection contains.
 */
export interface IItemAddedEventArgs<TItem> {
    /** The item that was added. */
    readonly item: TItem;
    /** The index where the item was added. */
    readonly index: number;

    /** Subscribes the provided `callback` that will be executed when the item is removed.
     * @param callback A callback that will be invoked when the item is removed.
     */
    addItemRemovalCallback(callback: ItemRemovedCallback<TItem>): void;
}

/** Represents an item removal callback.
 * @template TItem The type of items the collection contains.
 * @param item The item that was removed from the collection.
 * @param index The index from which the item was removed.
*/
export type ItemRemovedCallback<TItem> = (item: TItem, index: number) => void;

/** Contains information about the item that was removed from a collection.
 * @template TItem The type of items the collection contains.
 */
export interface IItemRemovedEventArgs<TItem> {
    /** The item that was removed. */
    readonly item: TItem;
    /** The index from which the item was removed. */
    readonly index: number;
}

/** Contains information about the changes in the collection.
 * @template TItem The type of items the collection contains.
 */
export interface ICollectionChange<TItem> {
    /** An array of added items, if any. */
    readonly addedItems: readonly TItem[];
    /** An array of removed items, if any. */
    readonly removedItems: readonly TItem[];
}