import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.every', (): void => {
    it('checking every element of an empty collection returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.every(_ => false),
                applyCollectionOperation: collection => collection.every(_ => false)
            },

            expectedResult: true
        });
    });

    it('checking every element of an collection when not all items satisfy the condition returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.every(item => item === 3),
                applyCollectionOperation: collection => collection.every(item => item === 3)
            },

            expectedResult: false
        });
    });

    it('checking every element of an collection when all items satisfy the condition returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.every(item => item > 0),
                applyCollectionOperation: collection => collection.every(item => item > 0)
            },

            expectedResult: true
        });
    });

    it('calling every passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>([1]);

        observableCollection.every((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling every with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.every(
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

    it('modifying the collection while executing every throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);
                observableCollection.every(_ => {
                    observableCollection.pop();
                    return false;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('calling every while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.every(_ => true);
            })
            .not
            .toThrow();
    });
});