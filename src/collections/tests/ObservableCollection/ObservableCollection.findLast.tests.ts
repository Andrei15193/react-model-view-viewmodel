import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.findLast', (): void => {
    it('searching in an empty colleciton returns undefined', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.findLast(item => item === 3),
                applyCollectionOperation: collection => collection.findLast(item => item === 3)
            }
        });
    });

    it('searching an item that does not exist in the collection returns undefined', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7],

            applyOperation: {
                applyArrayOperation: array => array.findLast(item => item === 10),
                applyCollectionOperation: collection => collection.findLast(item => item === 10)
            }
        });
    });

    it('searching an item that exist in the collection returns the last matching item', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6, 7],

            applyOperation: {
                applyArrayOperation: array => array.findLast(item => item % 2 === 0),
                applyCollectionOperation: collection => collection.findLast(item => item % 2 === 0)
            }
        });
    });

    it('calling findLast passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>(1);
        observableCollection.findLast((item, index, collection) => {
            invocationCount++;

            expect(item).toBe(1);
            expect(index).toBe(0);
            expect(collection).toStrictEqual(observableCollection);

            return true;
        });

        expect(invocationCount).toBe(1);
    });

    it('calling findLast with context passes it to the callback', (): void => {
        let invocationCount = 0;
        const context = {};
        const observableCollection = new ObservableCollection<number>(1);
        observableCollection.findLast(
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

    it('modifying the collection while executing findLast throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);
                observableCollection.findLast(_ => {
                    observableCollection.pop();
                    return true;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('searching while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.findLast(item => item % 2 === 0);
            })
            .not
            .toThrow();
    });
});