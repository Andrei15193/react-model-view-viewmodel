import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.indexOf', (): void => {
    it('searching in an empty colleciton returns -1', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.indexOf(1)
        });
    });

    it('searching an item that does not exist in the collection returns -1', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(4)
        });
    });

    it('searching an item that exist in the collection returns the first index where it is found', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(2)
        });
    });

    it('searching an item that exist in the collection and provided start index returns the first index where it is found after specified start', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(2, 3)
        });
    });

    it('searching an item that exist in the collection and provided negative start index returns the first index where it is found after specified start', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(2, -5)
        });
    });

    it('searching an item that exist in the collection and provided start index less than negative collection length returns the first index where it is found after specified start', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(2, -10)
        });
    });

    it('searching an item that exist in the collection and provided start index equal to collection length returns -1', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(2, 6)
        });
    });

    it('searching an item that exist in the collection and provided start index greater than collection length returns -1', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 1, 2, 3],

            applyOperation: collection => collection.indexOf(2, 10)
        });
    });

    it('searching while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.indexOf(2);
            })
            .not
            .toThrow();
    });
});