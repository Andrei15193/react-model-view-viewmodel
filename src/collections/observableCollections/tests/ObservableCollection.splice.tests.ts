import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation, testMutatingOperation } from './common';

describe('ObserableCollection.splice', (): void => {
    it('splicing an empty collection does not change it', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.splice(0, 2),

            expectedResult: []
        });
    });

    it('splicing a collection using start retains items until start', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: ['length', 2, 3, 4],

            applyOperation: collection => collection.splice(2),

            expectedCollection: [1, 2],
            expectedResult: [3, 4, 5]
        });
    });

    it('splicing a collection using negative start retrains items until normalized start', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: ['length', 3, 4],

            applyOperation: collection => collection.splice(-2),

            expectedCollection: [1, 2, 3],
            expectedResult: [4, 5]
        });
    });

    it('splicing a collection using start less than negative collection length clears all items', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5],
            changedProperties: ['length', 0, 1, 2, 3, 4],

            applyOperation: collection => collection.splice(-10),

            expectedCollection: [],
            expectedResult: [1, 2, 3, 4, 5]
        });
    });

    it('splicing a collection using start greater than collection length retains all items', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.splice(10),

            expectedResult: []
        });
    });

    it('splicing a collection using start and delete count retains items outside the specified range', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: ['length', 2, 3, 4, 5, 6, 7, 8],

            applyOperation: collection => collection.splice(2, 3),

            expectedCollection: [1, 2, 6, 7, 8, 9],
            expectedResult: [3, 4, 5]
        });
    });

    it('splicing a collection using start and delete count exceeding length retains items until start', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: ['length', 2, 3, 4, 5, 6, 7, 8],

            applyOperation: collection => collection.splice(2, 10),

            expectedCollection: [1, 2],
            expectedResult: [3, 4, 5, 6, 7, 8, 9]
        });
    });

    it('splicing a collection using start and negative delete count retains all items', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],

            applyOperation: collection => collection.splice(2, -2),

            expectedResult: []
        });
    });

    it('splicing a collection using start, delete count and replacement items updates the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: [2, 3, 4],

            applyOperation: collection => collection.splice(2, 3, 10, 20, 30),

            expectedCollection: [1, 2, 10, 20, 30, 6, 7, 8, 9],
            expectedResult: [3, 4, 5]
        });
    });

    it('splicing a collection using start, delete count and fewer replacement items updates the collection', (): void => {
        const arrayItems: number[] = [];
        const collectionItems: number[] = [];

        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: ['length', 2, 3, 4, 5, 6, 7, 8],

            applyOperation: collection => collection.splice(2, 3, 10),

            expectedCollection: [1, 2, 10, 6, 7, 8, 9],
            expectedResult: [3, 4, 5]
        });

        expect(collectionItems).toEqual(arrayItems);
    });

    it('splicing a collection using start, delete count and more replacement items updates the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: ['length', 2, 3, 4, 5, 6, 7, 8, 9, 10],

            applyOperation: collection => collection.splice(2, 3, 10, 20, 30, 40, 50),

            expectedCollection: [1, 2, 10, 20, 30, 40, 50, 6, 7, 8, 9],
            expectedResult: [3, 4, 5]
        });
    });

    it('splicing a collection using start, delete count exceeding length and replacement items adds them at the end', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: ['length', 2, 3, 4, 5, 6, 7, 8],

            applyOperation: collection => collection.splice(2, 10, 100, 200, 300, 400, 500),

            expectedCollection: [1, 2, 100, 200, 300, 400, 500],
            expectedResult: [3, 4, 5, 6, 7, 8, 9]
        });
    });

    it('splicing a collection using start exceeding length, delete count adds replacement items at the end', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'splice',
            initialState: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            changedProperties: ['length', 9, 10, 11, 12, 13],

            applyOperation: collection => collection.splice(20, 2, 100, 200, 300, 400, 500),

            expectedCollection: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100, 200, 300, 400, 500],
            expectedResult: []
        });
    });

    it('calling splice while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.splice(1);
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });
});