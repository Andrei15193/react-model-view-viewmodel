import type { IObservableMap } from '../../IObservableMap';
import { ObservableMap } from '../../ObservableMap';
import { expectMapsToBeEqual } from './expectMapsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestBlankMutatingOperationOptions<TKey, TItem> {
    readonly initialState: readonly (readonly [TKey, TItem])[];

    readonly applyOperation: ((map: Map<TKey, TItem> | IObservableMap<TKey, TItem>) => unknown) | {
        applyMapOperation(map: Map<TKey, TItem>): unknown;
        applyObservableMapOperation(observableMap: IObservableMap<TKey, TItem>): unknown;
    }

    readonly expectedResult: unknown;
}

/**
 * Applies the callback to both a map and an observable map constructed form the initial state,
 * checking the two before and after the operation is applied as well as checking the result of the operation.
 *
 * An observable map provides all relevant methods that are exposed by a native map thus the
 * two need to behave the same.
 */
export function testBlankMutatingOperation<TKey, TItem>({ initialState, expectedResult, applyOperation }: ITestBlankMutatingOperationOptions<TKey, TItem>): void {
    let propertiesChangedRaiseCount = 0;
    let mapChangedRaiseCount = 0;

    const map = new Map<TKey, TItem>(initialState);
    const observableMap = new ObservableMap<TKey, TItem>(initialState);
    observableMap.propertiesChanged.subscribe({
        handle() {
            propertiesChangedRaiseCount++;
        }
    });
    observableMap.mapChanged.subscribe({
        handle() {
            mapChangedRaiseCount++;
        }
    });

    expectMapsToBeEqual(observableMap, map);

    const mapResult = typeof applyOperation === 'function' ? applyOperation(map) : applyOperation.applyMapOperation(map);
    const observableMapResult = typeof applyOperation === 'function' ? applyOperation(observableMap) : applyOperation.applyObservableMapOperation(observableMap);

    expectMapsToBeEqual(observableMap, new Map<TKey, TItem>(initialState));
    expect(observableMapResult).toEqual(expectedResult === selfResult ? observableMap : expectedResult);

    expect(propertiesChangedRaiseCount).toBe(0);
    expect(mapChangedRaiseCount).toBe(0);

    expectMapsToBeEqual(observableMap, map);
    expect(observableMapResult).toEqual(expectedResult === selfResult ? observableMap : mapResult);
}