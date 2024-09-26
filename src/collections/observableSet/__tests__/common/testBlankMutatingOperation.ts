import type { IObservableSet } from '../../IObservableSet';
import { ObservableSet } from '../../ObservableSet';
import { expectSetsToBeEqual } from './expectSetsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestBlankMutatingOperationOptions<TItem> {
    readonly initialState: readonly TItem[];

    readonly applyOperation: ((set: Set<TItem> | IObservableSet<TItem>) => unknown) | {
        applySetOperation(set: Set<TItem>): unknown;
        applyObservableSetOperation(observableSet: IObservableSet<TItem>): unknown;
    }

    readonly expectedResult: unknown;
}

/**
 * Applies the callback to both a set and an observable set constructed form the initial state,
 * checking the two before and after the operation is applied as well as checking the result of the operation.
 *
 * An observable set provides all relevant methods that are exposed by a native Set thus the
 * two need to behave the same.
 */
export function testBlankMutatingOperation<TItem>({ initialState, expectedResult, applyOperation }: ITestBlankMutatingOperationOptions<TItem>): void {
    let propertiesChangedRaiseCount = 0;
    let setChangedRaiseCount = 0;

    const set = new Set<TItem>(initialState);
    const observableSet = new ObservableSet<TItem>(initialState);
    observableSet.propertiesChanged.subscribe({
        handle() {
            propertiesChangedRaiseCount++;
        }
    });
    observableSet.setChanged.subscribe({
        handle() {
            setChangedRaiseCount++;
        }
    });

    expectSetsToBeEqual(observableSet, set);

    const setResult = typeof applyOperation === 'function' ? applyOperation(set) : applyOperation.applySetOperation(set);
    const observableSetResult = typeof applyOperation === 'function' ? applyOperation(observableSet) : applyOperation.applyObservableSetOperation(observableSet);

    expectSetsToBeEqual(observableSet, new Set<TItem>(initialState));
    expect(observableSetResult).toEqual(expectedResult === selfResult ? observableSet : expectedResult);

    expect(propertiesChangedRaiseCount).toBe(0);
    expect(setChangedRaiseCount).toBe(0);

    expectSetsToBeEqual(observableSet, set);
    expect(observableSetResult).toEqual(expectedResult === selfResult ? observableSet : setResult);
}