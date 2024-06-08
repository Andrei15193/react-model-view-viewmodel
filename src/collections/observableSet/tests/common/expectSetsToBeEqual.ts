import { IReadOnlyObservableSet } from '../../IReadOnlyObservableSet';

export function expectSetsToBeEqual<TItem>(observableSet: IReadOnlyObservableSet<TItem>, set: Set<TItem>): void {
    expect(observableSet.size).toBe(set.size);
    expect(observableSet.toSet()).toEqual(set);

    expectIterationsToBeEqual(observableSet, set);
    expectRelatedIteratorsToBeEqual(observableSet, set);
}

function expectIterationsToBeEqual<TItem>(observableSet: IReadOnlyObservableSet<TItem>, set: Set<TItem>): void {
    const observableSetIterationResult: TItem[] = [];
    for (const item of observableSet)
        observableSetIterationResult.push(item);

    const setIterationResult: TItem[] = [];
    for (const item of set)
        setIterationResult.push(item);

    expect(observableSetIterationResult.sort()).toEqual(setIterationResult.sort());
}

function expectRelatedIteratorsToBeEqual<TItem>(observableSet: IReadOnlyObservableSet<TItem>, set: Set<TItem>): void {
    expect(Array.from(observableSet.keys()).sort()).toEqual(Array.from(set.keys()).sort());
    expect(Array.from(observableSet.entries()).sort()).toEqual(Array.from(set.entries()).sort());
    expect(Array.from(observableSet.values()).sort()).toEqual(Array.from(set.values()).sort());
}