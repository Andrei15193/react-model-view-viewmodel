import type { IReadOnlyObservableCollection } from "../../../src/observable-collection";

export function expectCollectionsToBeEqual<TItem>(observableCollection: IReadOnlyObservableCollection<TItem>, array: readonly TItem[]): void {
    expect(observableCollection.length).toBe(array.length);
    for (let index = 0; index < observableCollection.length; index++) {
        expect(observableCollection[index]).toBe(array[index]);
        expect(observableCollection.at(index)).toBe(array[index]);
    }
    expect(observableCollection.toArray()).toEqual(array);

    expectIndexesToBeDefined(observableCollection);
    expectIterationsToBeEqual(observableCollection, array);
}

function expectIndexesToBeDefined<TItem>(observableCollection: IReadOnlyObservableCollection<TItem>): void {
    expect(-1 in observableCollection).toBe(false);
    expect(observableCollection.length in observableCollection).toBe(false);
    expect((observableCollection.length + 1) in observableCollection).toBe(false);

    for (let index = 0; index < observableCollection.length; index++) {
        expect(index in observableCollection).toBe(true);
        expect(observableCollection[index]).toStrictEqual(observableCollection.at(index));
    }
}

function expectIterationsToBeEqual<TItem>(observableCollection: IReadOnlyObservableCollection<TItem>, array: readonly TItem[]): void {
    const observableCollectionIterationResult: TItem[] = [];
    for (const item of observableCollection)
        observableCollectionIterationResult.push(item);

    const arrayIterationResult: TItem[] = [];
    for (const item of array)
        arrayIterationResult.push(item);

    expect(observableCollectionIterationResult).toEqual(arrayIterationResult);
}