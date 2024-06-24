import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObservableSet.union', (): void => {
    it('getting the union between disjoint set and collection returns set containing all items from both', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [4, 5, 6],

            applyOperation: {
                applyObservableSetOperation: set => set.union(other),
                applySetOperation: set => union(set, other)
            },

            expectedResult: new Set([1, 2, 3, 4, 5, 6])
        });
    });

    it('getting the union between set and collection having same items returns set containing same items', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.union(other),
                applySetOperation: set => union(set, other)
            },

            expectedResult: new Set([1, 2, 3])
        });
    });

    it('getting the union between set and collection having some common items returns set containing all items from both', (): void => {
        const other = [3, 4, 5];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.union(other),
                applySetOperation: set => union(set, other)
            },

            expectedResult: new Set([1, 2, 3, 4, 5])
        });
    });

    it('getting the union between set and empty collection returns set containing same items', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.union(other),
                applySetOperation: set => union(set, other)
            },

            expectedResult: new Set([1, 2, 3])
        });
    });

    it('getting the union between empty set and collection returns set containing items form provided collection', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.union(other),
                applySetOperation: set => union(set, other)
            },

            expectedResult: new Set([1, 2, 3])
        });
    });

    it('getting the union between sets while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                const other = [4, 5, 6];

                for (const _ of observableSet) {
                    observableSet.union(other);
                    observableSet.union(new Set(other));
                    observableSet.union({
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

function union<TItem>(set: Set<TItem>, other: readonly TItem[]): Set<TItem> {
    return new Set<TItem>(Array.from(set.keys()).concat(other));
}