import type { DependencyList } from 'react';
import type { IEvent, IEventHandler } from '../events';
import { useEffect, useRef } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Represents an event handler callback.
 * @template TSubject The type of object that raises the event.
 * @template TEventArgs Optional, the type of the event context containing additional information about the event.
 * @param subject The object that raised the event.
 * @param args A set of arguments that provide context for the event.
 */
export type EventHandler<TSubject, TEventArgs = void> = (subject: TSubject, args: TEventArgs) => void;

/** Watches an event for changes, whenever the event is raised the callback will be invoked. The callback is not part of the hook dependencies, only the event is.
 * @template TSubject The type of object that raises the event.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 * @param event The event to watch.
 * @param handler The callback that handles the event.
 * @param deps Optional, additional dependencies along side the event.
 */
export function useEvent<TSubject, TEventArgs>(event: IEvent<TSubject, TEventArgs>, handler: EventHandler<TSubject, TEventArgs>, deps: DependencyList): void {
    const eventHandlerRef = useRef<IEventHandler<TSubject, TEventArgs> | null>(null);
    if (eventHandlerRef.current === null)
        eventHandlerRef.current = { handle: handler };

    useEffect(
        (): EffectResult => {
            if (event) {
                event.subscribe(eventHandlerRef.current);
                return () => event.unsubscribe(eventHandlerRef.current);
            }
        },
        [event, ...deps]
    );
}

/** Watches the event for changes, whenever the event is raised the callback will be invoked. The callback is not part of the hook dependencies, only the event is.
 * @deprecated In future versions this hook will be removed, switch to {@link useEvent}.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 * @param event The event to watch.
 * @param handler The callback that handles the event.
 * @param deps Optional, additional dependencies along side the event.
 */
export function watchEvent<TEventArgs>(event: IEvent<TEventArgs>, handler: EventHandler<TEventArgs>, deps?: DependencyList): void {
    useEvent(event, handler, deps || []);
}