import { ObservableCollection } from '../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.reduce', (): void => {
    it('reducing an empty collection without initial value throws exception', (): void => {
        const observableCollection = new ObservableCollection<number>();

        expect(
            () => {
                observableCollection.reduce((previous, current) => previous + current);
            })
            .toThrow(new Error('Cannot reduce an empty collection without providing an initial value.'));
    });

    it('reducing a collection goes through each item', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.reduce((previous, current) => previous * 10 + current),
                applyCollectionOperation: collection => collection.reduce((previous, current) => previous * 10 + current)
            },

            expectedResult: 123
        });
    });

    it('reducing an empty collection with initial value returns it', (): void => {
        const initialValue: object = {};

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyArrayOperation: array => array.reduce(result => result, initialValue),
                applyCollectionOperation: collection => collection.reduce(result => result, initialValue)
            },

            expectedResult: initialValue
        });
    });

    it('reducing a collection with initial value goes through each item', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyArrayOperation: array => array.reduce((result, current) => result + '0' + current.toString(), '0'),
                applyCollectionOperation: collection => collection.reduce((result, current) => result + '0' + current.toString(), '0')
            },

            expectedResult: '0010203'
        });
    });

    it('calling reduce passes arguments to each parameter accordingly', (): void => {
        let invocationCount = 0;
        const observableCollection = new ObservableCollection<number>([1]);
        const initialValue = {};
        observableCollection.reduce(
            (result, item, index, collection) => {
                invocationCount++;

                expect(result).toBe(initialValue);
                expect(item).toBe(1);
                expect(index).toBe(0);
                expect(collection).toStrictEqual(observableCollection);

                return item;
            },
            initialValue
        );

        expect(invocationCount).toBe(1);
    });

    it('modifying the collection while executing reduce throws exception', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);
                observableCollection.reduce((previous, current) => {
                    observableCollection.pop();
                    return previous + current;
                });
            })
            .toThrow(new Error('Collection has changed while being iterated.'));
    });

    it('calling reduce while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>([1, 2, 3]);

                for (const _ of observableCollection)
                    observableCollection.reduce((previous, current) => previous + current);
            })
            .not
            .toThrow();
    });
});