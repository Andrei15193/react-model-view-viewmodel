import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.toSplcied', (): void => {
    it('splicing an empty collection returns empty array', (): void => {
        let arrayInvocationCount = 0;
        let collectionInvocationCount = 0;

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.toSpliced(0, 2),

            expectedResult: []
        });

        expect(arrayInvocationCount).toBe(0);
        expect(collectionInvocationCount).toBe(0);
    });

    it('splicing a collection using start returns array containing items until start', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.toSpliced(2),

            expectedResult: [1, 2]
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using negative start returns array containing items until normalized start', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.toSpliced(-2),

            expectedResult: [1, 2, 3]
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start less than negative collection length returns empty array', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.toSpliced(-10),

            expectedResult: []
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start greater than collection length returns array containing all items', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.toSpliced(10),

            expectedResult: [1, 2, 3, 4, 5]
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start and delete count returns array without items in the specified range', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, 3),

            expectedResult: [1, 2, 6, 7, 8, 9]
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start and delete count exceeding length returns array containing items until start', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, 10),

            expectedResult: [1, 2]
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start and negative delete count returns array containing all items', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, -2),

            expectedResult: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start, delete count and replacement items returns array with replaced items', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, 3, 10, 20, 30),

            expectedResult: [1, 2, 10, 20, 30, 6, 7, 8, 9],
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start, delete count and fewer replacement items returns array with replaced items', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, 3, 10),

            expectedResult: [1, 2, 10, 6, 7, 8, 9],
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start, delete count and more replacement items returns array with replaced items', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, 3, 10, 20, 30, 40, 50),

            expectedResult: [1, 2, 10, 20, 30, 40, 50, 6, 7, 8, 9],
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start, delete count exceeding length and replacement items returns array with items added at the end', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(2, 10, 100, 200, 300, 400, 500),

            expectedResult: [1, 2, 100, 200, 300, 400, 500],
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start exceeding length, delete count and replacement items returns array with items added at the end', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.toSpliced(20, 2, 100, 200, 300, 400, 500),

            expectedResult: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100, 200, 300, 400, 500],
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('calling toSpliced while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.toSpliced(1);
            })
            .not
            .toThrow();
    });
});