import type { INotifyMapChanged, IMapChangedEventHandler } from '../collections';
import { useEffect, useState } from 'react';

/**
 * Watches an observable map for changes. The map is the only hook dependency.
 * @template TItem The type of items the map contains.
 * @param observableMap The map to watch.
 * @returns Returns the provided observable map.
 */
export function useObservableMap<TObservableMap extends INotifyMapChanged<TKey, TItem> | null | undefined, TKey, TItem>(observableMap: TObservableMap): TObservableMap {
    const [_, setState] = useState<unknown>(null);

    useEffect(
        () => {
            const mapChangedEventHandler: IMapChangedEventHandler<INotifyMapChanged<TKey, TItem>, TKey, TItem> = {
                handle() {
                    setState({});
                }
            }

            if (observableMap !== null && observableMap !== undefined)
                observableMap.mapChanged.subscribe(mapChangedEventHandler);

            return () => {
                if (observableMap !== null && observableMap !== undefined)
                    observableMap.mapChanged.unsubscribe(mapChangedEventHandler);
            }
        },
        [observableMap]
    );

    return observableMap;
}