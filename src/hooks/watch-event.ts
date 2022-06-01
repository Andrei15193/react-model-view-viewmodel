import type { DependencyList } from 'react';
import type { IEvent, IEventHandler } from '../events';
import { useEffect } from 'react';

type Destructor = () => void;
type EffectResult = void | Destructor;

/** Represents an event handler callback.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 * @param subject The object that raised the event.
 * @param args A set of arguments that provide context for the event.
 */
export type EventHandler<TEventArgs = void> = (subject: object, args: TEventArgs) => void;

/** Watches the event for changes, whenever the event is raised the callback will be invoked. The callback is not part of the hook dependencies, only the event is.
 * @template TEventArgs Optional, can be used to provide context when notifying subscribers.
 * @param event The event to watch.
 * @param handler The callback that handles the event.
 * @param deps Optional, additional dependencies along side the event.
 */
export function watchEvent<TEventArgs>(event: IEvent<TEventArgs>, handler: EventHandler<TEventArgs>, deps?: DependencyList): void {
    useEffect(
        (): EffectResult => {
            if (event) {
                const eventHandler: IEventHandler<TEventArgs> = { handle: handler };

                event.subscribe(eventHandler);
                return () => event.unsubscribe(eventHandler);
            }
        },
        deps ? [event, ...deps] : [event]
    );
}