import { ObservableSet } from '../ObservableSet';
import { testBlankMutatingOperation } from './common';

describe('ObserableSet.symmetricDifference', (): void => {
    it('getting the symmetric difference between disjoint set and collection returns set containing all items from both', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [4, 5, 6],

            applyOperation: {
                applyObservableSetOperation: set => set.symmetricDifference(other),
                applySetOperation: set => symmetricDifference(set, other)
            },

            expectedResult: new Set([1, 2, 3, 4, 5, 6])
        });
    });

    it('getting the symmetric difference between set and collection having same items returns empty set', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.symmetricDifference(other),
                applySetOperation: set => symmetricDifference(set, other)
            },

            expectedResult: new Set<number>()
        });
    });

    it('getting the symmetric difference between set and collection having some common items returns set containing all items except common ones', (): void => {
        const other = [3, 4, 5];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.symmetricDifference(other),
                applySetOperation: set => symmetricDifference(set, other)
            },

            expectedResult: new Set([1, 2, 4, 5])
        });
    });

    it('getting the symmetric difference between set and empty collection returns set containing same items', (): void => {
        const other: readonly number[] = [];

        testBlankMutatingOperation<number>({
            initialState: [1, 2, 3],

            applyOperation: {
                applyObservableSetOperation: set => set.symmetricDifference(other),
                applySetOperation: set => symmetricDifference(set, other)
            },

            expectedResult: new Set([1, 2, 3])
        });
    });

    it('getting the symmetric difference between empty set and collection returns set containing items form provided collection', (): void => {
        const other = [1, 2, 3];

        testBlankMutatingOperation<number>({
            initialState: [],

            applyOperation: {
                applyObservableSetOperation: set => set.symmetricDifference(other),
                applySetOperation: set => symmetricDifference(set, other)
            },

            expectedResult: new Set([1, 2, 3])
        });
    });

    it('getting the symmetric difference between sets while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableSet = new ObservableSet<number>([1, 2, 3]);
                const other = [4, 5, 6];

                for (const _ of observableSet) {
                    observableSet.symmetricDifference(other);
                    observableSet.symmetricDifference(new Set(other));
                    observableSet.symmetricDifference({
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

function symmetricDifference<TItem>(set: Set<TItem>, other: readonly TItem[]): Set<TItem> {
    return new Set<TItem>(
        Array
            .from(set.keys())
            .filter(item => !other.includes(item))
            .concat(other.filter(item => !set.has(item)))
    );
}