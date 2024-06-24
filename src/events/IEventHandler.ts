/**
 * An event handler used to subscribe to events. Similar to an EventHandler delegate in .NET.
 * @template TSubject The type of object that raises the event.
 * @template TEventArgs Optional, the type of the event context containing additional information about the event.
 */
export interface IEventHandler<TSubject, TEventArgs = void> {
    /**
     * The method that handles the event.
     * @param subject The object that raised the event.
     * @param args A set of arguments that provide context for the event.
     */
    handle(subject: TSubject, args: TEventArgs): void;
}