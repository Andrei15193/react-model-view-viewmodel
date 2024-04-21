import { ObservableCollection } from "../../src/observable-collection";
import { testBlankMutatingOperation, testMutatingOperation } from "./common";

describe('ObserableCollection.pop', (): void => {
    it('poping an item from an empty collection has no effect', (): void => {
        testBlankMutatingOperation<number>(collection => collection.pop(), []);
    });

    it('poping an item from a non-empty collection returns the last item', (): void => {
        testMutatingOperation<number>("pop", collection => collection.pop(), [1, 2, 3]);
    });

    it('popping items while iterating will break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>(1, 2, 3);

                for (let _ of observableCollection)
                    observableCollection.pop();
            })
            .toThrow(new Error("Collection has changed while being iterated."))
    });

    it('popping items from empty collection while iterating will not break iterators', (): void => {
        expect(
            () => {
                const observableCollection = new ObservableCollection<number>();
                const iterator = observableCollection[Symbol.iterator]();

                observableCollection.pop();

                iterator.next();
            })
            .not
            .toThrow()
    });
});