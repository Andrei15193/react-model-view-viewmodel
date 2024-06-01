import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.filter', (): void => {
    it('filtering an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.filter(item => item > 0),
                applyCollectionOperation: collection => collection.filter(item => item > 0)
            },

            expectedResult: []
        });
    });

    it('filtering a collection returns an array containing the result', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.filter(item => item === 2),
                applyCollectionOperation: collection => collection.filter(item => item === 2)
            },

            expectedResult: [2]
        });
    });

    it('calling filter passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.filter((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling filter with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>([1]);
        observableCollection.filter(
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

    it('modifying the collection while executing filter throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);
                observableCollection.filter(_ => {
                    observableCollection.pop();
                    return true;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('calling filter while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.filter(item => item > 1);
            })
            .not
            .toThrow();
    });
});