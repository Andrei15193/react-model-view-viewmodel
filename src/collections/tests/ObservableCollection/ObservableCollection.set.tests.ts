import { ObservableCollection } from '../../ObservableCollection';
import { testMutatingOperation } from './common';

describe('ObserableCollection.set', (): void => {
    it('setting an item updates the collection', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'set',
            initialState: [1, 2, 3],
            changedProperties: [1],

            applyOperation: {
                applyArrayOperation(array) {
                    array[1] = 10;
                },
                applyCollectionOperation(collection) {
                    collection.set(1, 10);
                }
            }
        });
    });

    it('setting an item using negative index updates the collection from the end', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'set',
            initialState: [1, 2, 3],
            changedProperties: [2],

            applyOperation: {
                applyArrayOperation(array) {
                    array[2] = 10;
                },
                applyCollectionOperation(collection) {
                    collection.set(-1, 10);
                }
            }
        });
    });

    it('setting an item using negative index that is less than negative length updates the first index', (): void => {
        testMutatingOperation<number>({
            collectionOperation: 'set',
            initialState: [1, 2, 3],
            changedProperties: [0],

            applyOperation: {
                applyArrayOperation(array) {
                    array[0] = 10;
                },
                applyCollectionOperation(collection) {
                    collection.set(-10, 10);
                }
            }
        });
    });

    it('setting an item beyond the collection length expands it', (): void => {
        testMutatingOperation<number | undefined>({
            collectionOperation: 'set',
            initialState: [1, 2, 3],
            changedProperties: ['length', 10],

            applyOperation: {
                applyArrayOperation(array) {
                    array[10] = 100;
                },
                applyCollectionOperation(collection) {
                    collection.set(10, 100);
                }
            }
        });
    });

    it('setting items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (const _ of observableCollection)
                    observableCollection.set(1, 10);
            })
            .toThrow(new Error('Collection has changed while being iterated.'))
    });
});