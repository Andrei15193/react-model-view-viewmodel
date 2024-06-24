import type { IObservableMap } from '../../IObservableMap';
import type { MapChangeOperation } from '../../IMapChange';
import { ObservableMap } from '../../ObservableMap';
import { expectMapsToBeEqual } from './expectMapsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestMutatingOperationOptions<TKey, TItem> {
    readonly mapOperation: MapChangeOperation;
    readonly initialState: readonly (readonly [TKey, TItem])[];
    readonly changedProperties: readonly ('size')[];

    readonly applyOperation: ((map: Map<TKey, TItem> | IObservableMap<TKey, TItem>) => unknown) | {
        applyMapOperation(map: Map<TKey, TItem>): unknown;
        applyObservableMapOperation(observableMap: IObservableMap<TKey, TItem>): unknown;
    }

    readonly expectedMap: readonly (readonly [TKey, TItem])[];
    readonly expectedResult: unknown;
}

/**
 * Applies the callback to both a map and an observable map constructed form the initial state,
 * checking the two before and after the operation is applied as well as checking the result of the operation.
 *
 * An observable map provides all relevant methods that are exposed by a native map thus the
 * two need to behave the same.
 */
export function testMutatingOperation<TKey, TItem>({ mapOperation, initialState, changedProperties, expectedMap: expectedState, expectedResult, applyOperation }: ITestMutatingOperationOptions<TKey, TItem>): void {
    let propertiesChangedRaiseCount = 0;
    let mapChangedRaiseCount = 0;
    let actualChangedProperties: readonly (keyof ObservableMap<TKey, TItem>)[] = [];

    const map = new Map<TKey, TItem>(initialState);
    const observableMap = new ObservableMap<TKey, TItem>(initialState);
    observableMap.propertiesChanged.subscribe({
        handle(subject, changedProperties) {
            propertiesChangedRaiseCount++;

            expect(subject).toStrictEqual(observableMap);
            actualChangedProperties = changedProperties;
        }
    });
    observableMap.mapChanged.subscribe({
        handle(subject, { operation, addedEntries, removedEntries }) {
            mapChangedRaiseCount++;

            expect(subject).toStrictEqual(observableMap);
            expect(operation).toEqual(mapOperation);

            removedEntries.forEach(([removedKey]) => map.delete(removedKey));
            addedEntries.forEach(([addedKey, addedItem]) => map.set(addedKey, addedItem));
        }
    });

    expectMapsToBeEqual(observableMap, map);

    const mapResult = typeof applyOperation === 'function' ? applyOperation(map) : applyOperation.applyMapOperation(map);
    const observableMapResult = typeof applyOperation === 'function' ? applyOperation(observableMap) : applyOperation.applyObservableMapOperation(observableMap);

    expectMapsToBeEqual(observableMap, new Map<TKey, TItem>(expectedState));
    expect(observableMapResult).toEqual(expectedResult === selfResult ? observableMap : expectedResult);

    expect(propertiesChangedRaiseCount).toBe(1);
    expect(mapChangedRaiseCount).toBe(1);
    expect(actualChangedProperties).toEqual(changedProperties);

    expectMapsToBeEqual(observableMap, map);
    expect(observableMapResult).toEqual(expectedResult === selfResult ? observableMap : mapResult);
}