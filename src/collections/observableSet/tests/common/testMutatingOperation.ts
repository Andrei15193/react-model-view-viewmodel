import type { IObservableSet } from '../../IObservableSet';
import type { SetChangeOperation } from '../../ISetChange';
import { ObservableSet } from '../../ObservableSet';
import { expectSetsToBeEqual } from './expectSetsToBeEqual';
import { selfResult } from './selfResult';

export interface ITestMutatingOperationOptions<TItem> {
    readonly setOperation: SetChangeOperation;
    readonly initialState: readonly TItem[];
    readonly changedProperties: readonly ('size')[];

    readonly applyOperation: ((set: Set<TItem> | IObservableSet<TItem>) => unknown) | {
        applySetOperation(set: Set<TItem>): unknown;
        applyObservableSetOperation(observableSet: IObservableSet<TItem>): unknown;
    }

    readonly expectedSet: readonly TItem[];
    readonly expectedResult: unknown;
}

/**
 * Applies the callback to both a set and an observable set constructed form the initial state,
 * checking the two before and after the operation is applied as well as checking the result of the operation.
 *
 * An observable set provides all relevant methods that are exposed by a native set thus the
 * two need to behave the same.
 */
export function testMutatingOperation<TItem>({ setOperation, initialState, changedProperties, expectedSet: expectedState, expectedResult, applyOperation }: ITestMutatingOperationOptions<TItem>): void {
    let propertiesChangedRaiseCount = 0;
    let setChangedRaiseCount = 0;
    let actualChangedProperties: readonly (keyof ObservableSet<TItem>)[] = [];

    const set = new Set<TItem>(initialState);
    const observableSet = new ObservableSet<TItem>(initialState);
    observableSet.propertiesChanged.subscribe({
        handle(subject, changedProperties) {
            propertiesChangedRaiseCount++;

            expect(subject).toStrictEqual(observableSet);
            actualChangedProperties = changedProperties;
        }
    });
    observableSet.setChanged.subscribe({
        handle(subject, { operation, addedItems, removedItems }) {
            setChangedRaiseCount++;

            expect(subject).toStrictEqual(observableSet);
            expect(operation).toEqual(setOperation);

            addedItems.forEach(addedItem => set.add(addedItem));
            removedItems.forEach(removedItem => set.delete(removedItem));
        }
    });

    expectSetsToBeEqual(observableSet, set);

    const setResult = typeof applyOperation === 'function' ? applyOperation(set) : applyOperation.applySetOperation(set);
    const observableSetResult = typeof applyOperation === 'function' ? applyOperation(observableSet) : applyOperation.applyObservableSetOperation(observableSet);

    expectSetsToBeEqual(observableSet, new Set<TItem>(expectedState));
    expect(observableSetResult).toEqual(expectedResult === selfResult ? observableSet : expectedResult);

    expect(propertiesChangedRaiseCount).toBe(1);
    expect(setChangedRaiseCount).toBe(1);
    expect(actualChangedProperties).toEqual(changedProperties);

    expectSetsToBeEqual(observableSet, set);
    expect(observableSetResult).toEqual(expectedResult === selfResult ? observableSet : setResult);
}