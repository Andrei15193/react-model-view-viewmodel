import { IReadOnlyObservableMap } from '../../IReadOnlyObservableMap';

export function expectMapsToBeEqual<TKey, TItem>(observableMap: IReadOnlyObservableMap<TKey, TItem>, map: Map<TKey, TItem>): void {
    expect(observableMap.size).toBe(map.size);
    expect(observableMap.toMap()).toEqual(map);

    expectIterationsToBeEqual(observableMap, map);
    expectRelatedIteratorsToBeEqual(observableMap, map);
}

function expectIterationsToBeEqual<TKey, TItem>(observableMap: IReadOnlyObservableMap<TKey, TItem>, map: Map<TKey, TItem>): void {
    const observableMapIterationResult: (readonly [TKey, TItem])[] = [];
    for (const item of observableMap)
        observableMapIterationResult.push(item);

    const mapIterationResult: (readonly [TKey, TItem])[] = [];
    for (const item of map)
        mapIterationResult.push(item);

    expect(observableMapIterationResult.sort()).toEqual(mapIterationResult.sort());
}

function expectRelatedIteratorsToBeEqual<TKey, TItem>(observableMap: IReadOnlyObservableMap<TKey, TItem>, map: Map<TKey, TItem>): void {
    expect(Array.from(observableMap.keys()).sort()).toEqual(Array.from(map.keys()).sort());
    expect(Array.from(observableMap.entries()).sort()).toEqual(Array.from(map.entries()).sort());
    expect(Array.from(observableMap.values()).sort()).toEqual(Array.from(map.values()).sort());
}