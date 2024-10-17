import type { INotifySetChanged, ISetChangedEventHandler } from '../collections';
import { useEffect, useState } from 'react';

/**
 * Watches an observable set for changes. The set is the only hook dependency.
 * @template TObservableSet The observable set type.
 * @template TItem The type of items the set contains.
 * @param observableSet The set to watch.
 * @returns Returns the provided observable set.
 */
export function useObservableSet<TObservableSet extends INotifySetChanged<TItem> | null | undefined, TItem>(observableSet: TObservableSet): TObservableSet {
    const [_, setState] = useState<unknown>(null);

    useEffect(
        () => {
            const setChangedEventHandler: ISetChangedEventHandler<INotifySetChanged<TItem>, TItem> = {
                handle() {
                    setState({});
                }
            }

            if (observableSet !== null && observableSet !== undefined)
                observableSet.setChanged.subscribe(setChangedEventHandler);

            return () => {
                if (observableSet !== null && observableSet !== undefined)
                    observableSet.setChanged.unsubscribe(setChangedEventHandler);
            }
        },
        [observableSet]
    );

    return observableSet;
}