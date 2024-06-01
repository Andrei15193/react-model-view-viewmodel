import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.findIndex', (): void => {
    it('searching in an empty colleciton returns -1', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.findIndex(item => item === 3),
                applyCollectionOperation: collection => collection.findIndex(item => item === 3)
            },

            expectedResult: -1
        });
    });

    it('searching an item that does not exist in the collection returns -1', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7],

            applyOperation: {
                applyArrayOperation: array => array.findIndex(item => item === 10),
                applyCollectionOperation: collection => collection.findIndex(item => item === 10)
            },

            expectedResult: -1
        });
    });

    it('searching an item that exist in the collection returns the index of the first matching item', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7],

            applyOperation: {
                applyArrayOperation: array => array.findIndex(item => item % 2 === 0),
                applyCollectionOperation: collection => collection.findIndex(item => item % 2 === 0)
            },

            expectedResult: 1
        });
    });

    it('calling findIndex passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.findIndex((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling findIndex with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.findIndex(
            function (item, index, collection) {
                invocationCount++;

                expect(this).toStrictEqual(context);
                expect(item).toBe(1);
                expect(index).toBe(0);
                expect(collection).toStrictEqual(observableCollection);

                return true;
            },
            context
        );

        expect(invocationCount).toBe(1);
    });

    it('modifying the collection while executing findIndex throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);
                observableCollection.findIndex(_ => {
                    observableCollection.pop();
                    return true;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('searching while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.findIndex(item => item % 2 === 0);
            })
            .not
            .toThrow();
    });
});