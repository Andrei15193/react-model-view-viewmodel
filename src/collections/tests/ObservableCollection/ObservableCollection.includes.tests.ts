import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.includes', (): void => {
    it('searching in an empty colleciton returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.includes(1),

            expectedResult: false
        });
    });

    it('searching an item that does not exist in the collection returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(10),

            expectedResult: false
        });
    });

    it('searching an item that exist in the collection returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(2),

            expectedResult: true
        });
    });

    it('searching an item that exist in the collection before the provided start index returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(2, 3),

            expectedResult: false
        });
    });

    it('searching an item that exist in the collection after the provided start index returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(4, 3),

            expectedResult: true
        });
    });

    it('searching an item that exist in the collection before the provided negative index returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(2, -3),

            expectedResult: false
        });
    });

    it('searching an item that exist in the collection after the provided negative index returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(5, -3),

            expectedResult: true
        });
    });

    it('searching an item that exist in the collection providing a start less than negative collection length index returns true', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(2, -10),

            expectedResult: true
        });
    });

    it('searching an item that exist in the collection providing a start greater than collection length index returns false', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5, 6],

            applyOperation: collection => collection.includes(2, 10),

            expectedResult: false
        });
    });

    it('searching while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.includes(2);
            })
            .not
            .toThrow();
    });
});