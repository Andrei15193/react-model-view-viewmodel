import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObservableSet.difference', (): void => {
    it('getting the difference between disjoint set and collection returns set with same items', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [4, 5, 6],

            applyOperation: {
                applyObservableSetOperation: set => set.difference(other),
                applySetOperation: set => difference(set, other)
            },

            expectedResult: new Set([4, 5, 6])
        });
    });

    it('getting the difference between set and collection having same items returns empty set', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.difference(other),
                applySetOperation: set => difference(set, other)
            },

            expectedResult: new Set<number>()
        });
    });

    it('getting the difference between set and collection having some common items returns items from set that are not in the collection', (): void => {
        const other = [3, 4, 5];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.difference(other),
                applySetOperation: set => difference(set, other)
            },

            expectedResult: new Set([1, 2])
        });
    });

    it('getting the difference between set and empty collection returns set containing all items', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.difference(other),
                applySetOperation: set => difference(set, other)
            },

            expectedResult: new Set([1, 2, 3])
        });
    });

    it('getting the difference between empty set and collection returns empty set', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.difference(other),
                applySetOperation: set => difference(set, other)
            },

            expectedResult: new Set<number>()
        });
    });

    it('getting the difference between sets while iterating does not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                const other = [4, 5, 6];

                for (const _ of observableSet) {
                    observableSet.difference(other);
                    observableSet.difference(new Set(other));
                    observableSet.difference({
                        size: other.length,
                        keys() {
                            return other[Symbol.iterator]();
                        },
                        has: other.includes.bind(other)
                    });
                }
            })
            .not
            .toThrow()
    });
});

function difference<TItem>(set: Set<TItem>, other: readonly TItem[]): Set<TItem> {
    return new Set<TItem>(Array.from(set.keys()).filter(item => !other.includes(item)));
}