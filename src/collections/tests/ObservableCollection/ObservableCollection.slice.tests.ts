import { ObservableCollection } from '../../ObservableCollection';
import { testBlankMutatingOperation } from './common';

describe('ObserableCollection.slice', (): void => {
    it('slicing an empty collection returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: collection => collection.slice(),
        });
    });

    it('slicing without parameters returns an array containing all items', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: collection => collection.slice(),
        });
    });

    it('slicing with start index returns an array containing items starting at provided index', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(2),
        });
    });

    it('slicing with negative start index returns an array containing items from the end of the collection', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(-3),
        });
    });

    it('slicing with negative start index less than negative length returns an array containing all items', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(-10),
        });
    });

    it('slicing with start and end index returns an array containing items from the provided range (excluding end index)', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(1, 3),
        });
    });

    it('slicing with start and negative end index returns an array containing items from the provided range (excluding end index)', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(2, -1),
        });
    });

    it('slicing with start and end index beyond length returns an array containing items starting at provided index', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(2, 10),
        });
    });

    it('slicing with start greater than end index returns an empty array', (): void => {
        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3, 4, 5],

            applyOperation: collection => collection.slice(3, 2),
        });
    });

    it('slicing while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.slice();
            })
            .not
            .toThrow();
    });
});