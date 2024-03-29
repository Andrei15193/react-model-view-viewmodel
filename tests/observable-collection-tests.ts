import { ObservableCollection } from '../src/observable-collection';

describe('observable-collection/observableCollection', (): void => {
    it('creating an observable collection with no initial items is empty', (): void => {
        const collection = new ObservableCollection();

        expect(collection.toArray()).toEqual([]);
    });

    it('creating an observable collection with initial items initializes it with them', (): void => {
        const collection = new ObservableCollection(1, 2, 3);

        expect(collection.toArray()).toEqual([1, 2, 3]);
    });

    it('pusing an item notifies observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(item).toBe(1);
                expect(index).toBe(0);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([1]);
                expect(collectionChange.removedItems).toEqual([]);
            }
        });

        collection.push(1);

        expect(collection.toArray()).toEqual([1]);
        expect(raisedEvents).toEqual(['itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('pushing an item offsets the addedItems to added index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(item).toBe(4);
                expect(index).toBe(3);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                let iterations = 0;
                collectionChange.addedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).toBe(4);
                    expect(index).toBe(3);
                });
                expect(iterations).toBe(1);
                expect(collectionChange.addedItems).toEqual(new Array(3).concat(4));
                expect(collectionChange.removedItems).toEqual([]);
            }
        });

        collection.push(4);

        expect(collection.toArray()).toEqual([1, 2, 3, 4]);
        expect(raisedEvents).toEqual(['itemAdded', 'collectionChanged']);
    });

    it('popping an item from empty collection does not notify observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const poppedValue = collection.pop();

        expect(collection.toArray()).toEqual([]);
        expect(poppedValue).toBe(undefined);
        expect(raisedEvents).toEqual([]);
    });

    it('popping an item from non-empty collection notifies observers', (): void => {
        const collection = new ObservableCollection(1);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(item).toBe(1);
                expect(index).toBe(0);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([]);
                expect(collectionChange.removedItems).toEqual([1]);
            }
        });

        const poppedValue = collection.pop();

        expect(collection.toArray()).toEqual([]);
        expect(poppedValue).toBe(1);
        expect(raisedEvents).toEqual(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('popping an item offsets the removedItems to removed index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(item).toBe(3);
                expect(index).toBe(2);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                let iterations = 0;
                expect(collectionChange.addedItems).toEqual([]);
                collectionChange.removedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).toBe(3);
                    expect(index).toBe(2);
                });
                expect(iterations).toBe(1);
                expect(collectionChange.removedItems).toEqual(new Array(2).concat(3));
            }
        });

        collection.pop();

        expect(collection.toArray()).toEqual([1, 2]);
        expect(raisedEvents).toEqual(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('unshifting an item notifies observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(item).toBe(1);
                expect(index).toBe(0);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([1]);
                expect(collectionChange.removedItems).toEqual([]);
            }
        });

        collection.unshift(1);

        expect(collection.toArray()).toEqual([1]);
        expect(raisedEvents).toEqual(['itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('unshifting an item offsets the addedItems to added index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(item).toBe(4);
                expect(index).toBe(0);
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                let iterations = 0;
                collectionChange.addedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).toBe(4);
                    expect(index).toBe(0);
                });
                expect(iterations).toBe(1);
                expect(collectionChange.addedItems).toEqual([4]);
                expect(collectionChange.removedItems).toEqual([]);
            }
        });

        collection.unshift(4);

        expect(collection.toArray()).toEqual([4, 1, 2, 3]);
        expect(raisedEvents).toEqual(['itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('shifting an item from empty collection does not notify observers', (): void => {
        const collection = new ObservableCollection<number>();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const shiftedValue = collection.shift();

        expect(collection.toArray()).toEqual([]);
        expect(shiftedValue).toBe(undefined);
        expect(raisedEvents).toEqual([]);
    });

    it('shifting an item from non-empty collection notifies observers', (): void => {
        const collection = new ObservableCollection(1);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(item).toBe(1);
                expect(index).toBe(0);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([]);
                expect(collectionChange.removedItems).toEqual([1]);
            }
        });

        const shiftedValue = collection.shift();

        expect(collection.toArray()).toEqual([]);
        expect(shiftedValue).toBe(1);
        expect(raisedEvents).toEqual(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('shifting an item offsets the removedItems to removed index', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(item).toBe(1);
                expect(index).toBe(0);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([]);
                let iterations = 0;
                collectionChange.removedItems.forEach((item, index) => {
                    iterations++;
                    expect(item).toBe(1);
                    expect(index).toBe(0);
                });
                expect(iterations).toBe(1);
                expect(collectionChange.removedItems).toEqual([1]);
            }
        });

        collection.shift();

        expect(collection.toArray()).toEqual([2, 3]);
        expect(raisedEvents).toEqual(['itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('getting an item works the same way as an indexer', (): void => {
        const collection = new ObservableCollection(1, 2, 3);

        for (let index = 0; index < 3; index++)
            expect(collection.get(index)).toBe(collection[index]);
    });

    it('getting an item at a negative index throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection(1, 2, 3);

        try {
            collection.get(-1);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).toBeInstanceOf(RangeError);
    });

    it('getting an item beyond the length of the collection throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection(1, 2, 3);

        try {
            collection.get(collection.length);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).toBeInstanceOf(RangeError);
    });

    it('setting an item works the same was as an indexer', (): void => {
        const collection = new ObservableCollection(10, 20, 30);

        for (let index = 0; index < 3; index++) {
            collection.set(index, index);
            expect(collection.get(index)).toBe(collection[index]);
            expect(collection.length).toBe(3);
        }
    });

    it('setting an item at a negative index throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection();

        try {
            collection.set(-1, 0);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).toBeInstanceOf(RangeError);
    });

    it('setting an item beyond the length of the collection throws error', (): void => {
        let error: Error | undefined = undefined;
        const collection = new ObservableCollection(1, 2, 3);

        try {
            collection.set(3, 0);
        }
        catch (actualError) {
            error = actualError;
        }
        expect(error).toBeInstanceOf(RangeError);
    });

    it('setting an item notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(item).toBe(4);
                expect(index).toBe(1);
            }
        });
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(item).toBe(2);
                expect(index).toBe(1);
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, { addedItems, removedItems }) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                addedItems.forEach((item, index) => {
                    expect(item).toBe(4);
                    expect(index).toBe(1);
                });
                expect(addedItems).toEqual(new Array(1).concat(4));
                removedItems.forEach((item, index) => {
                    expect(item).toBe(2);
                    expect(index).toBe(1);
                });
                expect(removedItems).toEqual(new Array(1).concat(2));
            }
        });

        collection.set(1, 4);

        expect(collection.toArray()).toEqual([1, 4, 3]);
        expect(raisedEvents).toEqual(['itemRemoved', 'itemAdded', 'collectionChanged']);
    });

    it('splicing an empty observable collection does not notify observers', (): void => {
        const collection = new ObservableCollection();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const removedItems = collection.splice(0);

        expect(collection.toArray()).toEqual([]);
        expect(removedItems).toEqual([]);
        expect(raisedEvents).toEqual([]);
    });

    it('splicing a non-empty collection notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        let eventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(0);
                expect(item).toBe(eventHandlerInvokationCount + 1);
                expect(index).toBe(eventHandlerInvokationCount);
                eventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([]);
                expect(collectionChange.removedItems).toEqual([1, 2, 3]);
            }
        });

        const removedItems = collection.splice(0, 10);

        expect(collection.toArray()).toEqual([]);
        expect(removedItems).toEqual([1, 2, 3]);
        expect(raisedEvents).toEqual(['itemRemoved', 'itemRemoved', 'itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('splicing a non-empty collection offsets the removedItems to removed index', (): void => {
        const collection = new ObservableCollection(1, 2, 3, 4);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        let eventHandlerInvokationCount = 1;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(2);
                expect(item).toBe(eventHandlerInvokationCount + 1);
                expect(index).toBe(eventHandlerInvokationCount);
                eventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([]);
                let iterations = 0;
                collectionChange.removedItems.forEach((item, index) => {
                    if (iterations === 0) {
                        expect(item).toBe(2);
                        expect(index).toBe(1);
                    }
                    else if (iterations === 1) {
                        expect(item).toBe(3);
                        expect(index).toBe(2);
                    }
                    iterations++;
                });
                expect(iterations).toBe(2);
                expect(collectionChange.removedItems).toEqual(new Array(1).concat([2, 3]));
            }
        });

        const removedItems = collection.splice(1, 2);

        expect(collection.toArray()).toEqual([1, 4]);
        expect(removedItems).toEqual([2, 3]);
        expect(raisedEvents).toEqual(['itemRemoved', 'itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('clearing an empty observable collection does not notify observers', (): void => {
        const collection = new ObservableCollection();
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle() {
                raisedEvents.push('propertiesChanged');
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        collection.itemRemoved.subscribe({
            handle() {
                raisedEvents.push('itemRemoved');
            }
        });
        collection.collectionChanged.subscribe({
            handle() {
                raisedEvents.push('collectionChanged');
            }
        });

        const removedItems = collection.clear();

        expect(collection.toArray()).toEqual([]);
        expect(removedItems).toEqual([]);
        expect(raisedEvents).toEqual([]);
    });

    it('clearing a non-empty observable collection notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        collection.itemAdded.subscribe({
            handle() {
                raisedEvents.push('itemAdded');
            }
        });
        let eventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(0);
                expect(item).toBe(eventHandlerInvokationCount + 1);
                expect(index).toBe(eventHandlerInvokationCount);
                eventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([]);
                expect(collectionChange.removedItems).toEqual([1, 2, 3]);
            }
        });

        const removedItems = collection.clear();

        expect(collection.toArray()).toEqual([]);
        expect(removedItems).toEqual([1, 2, 3]);
        expect(raisedEvents).toEqual(['itemRemoved', 'itemRemoved', 'itemRemoved', 'collectionChanged', 'propertiesChanged']);
    });

    it('resetting an observable collection notifies observers', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(subject, changedProperties) {
                raisedEvents.push('propertiesChanged');
                expect(subject).toBe(collection);
                expect(changedProperties).toEqual(['length']);
            }
        });
        let itemAddedEventHandlerInvokationCount = 0;
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(4);
                expect(item).toBe(itemAddedEventHandlerInvokationCount + 4);
                expect(index).toBe(itemAddedEventHandlerInvokationCount);
                itemAddedEventHandlerInvokationCount++;
            }
        });
        let itemRemovedEventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(4);
                expect(item).toBe(itemRemovedEventHandlerInvokationCount + 1);
                expect(index).toBe(itemRemovedEventHandlerInvokationCount);
                itemRemovedEventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([4, 5, 6, 7]);
                expect(collectionChange.removedItems).toEqual([1, 2, 3]);
            }
        });

        collection.reset(4, 5, 6, 7);

        expect(collection.toArray()).toEqual([4, 5, 6, 7]);
        expect(raisedEvents).toEqual(['itemRemoved', 'itemRemoved', 'itemRemoved', 'itemAdded', 'itemAdded', 'itemAdded', 'itemAdded', 'collectionChanged', 'propertiesChanged']);
    });

    it('resetting an observable collection with same number of items does not notify length changed', (): void => {
        const collection = new ObservableCollection(1, 2, 3);
        const raisedEvents: string[] = [];
        collection.propertiesChanged.subscribe({
            handle(_, changedProperties) {
                if (changedProperties.includes('length'))
                    raisedEvents.push('propertiesChanged');
            }
        });
        let itemAddedEventHandlerInvokationCount = 0;
        collection.itemAdded.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(3);
                expect(item).toBe(itemAddedEventHandlerInvokationCount + 4);
                expect(index).toBe(itemAddedEventHandlerInvokationCount);
                itemAddedEventHandlerInvokationCount++;
            }
        });
        let itemRemovedEventHandlerInvokationCount = 0;
        collection.itemRemoved.subscribe({
            handle(subject, { item, index }) {
                raisedEvents.push('itemRemoved');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(3);
                expect(item).toBe(itemRemovedEventHandlerInvokationCount + 1);
                expect(index).toBe(itemRemovedEventHandlerInvokationCount);
                itemRemovedEventHandlerInvokationCount++;
            }
        });
        collection.collectionChanged.subscribe({
            handle(subject, collectionChange) {
                raisedEvents.push('collectionChanged');
                expect(subject).toBe(collection);
                expect(collectionChange.addedItems).toEqual([4, 5, 6]);
                expect(collectionChange.removedItems).toEqual([1, 2, 3]);
            }
        });

        collection.reset(4, 5, 6);

        expect(collection.toArray()).toEqual([4, 5, 6]);
        expect(raisedEvents).toEqual(['itemRemoved', 'itemRemoved', 'itemRemoved', 'itemAdded', 'itemAdded', 'itemAdded', 'collectionChanged']);
    });

    it('removing an item that was previously added has the removal callback called', (): void => {
        const collection = new ObservableCollection(1, 2, 3, 4, 5);
        const raisedEvents: string[] = [];
        collection.itemAdded.subscribe({
            handle(subject, { item, index, addItemRemovalCallback }) {
                raisedEvents.push('itemAdded');
                expect(subject).toBe(collection);
                expect(collection.length).toBe(6);
                expect(item).toBe(7);
                expect(index).toBe(2);
                addItemRemovalCallback((item, index) => {
                    raisedEvents.push('itemAdded.removalCallback');
                    expect(item).toBe(7);
                    expect(index).toBe(0);
                    expect(collection.length).toBe(3);
                });
            }
        });

        collection.splice(2, 0, 7);
        collection.splice(0, 2);
        expect(collection.toArray()).toEqual([7, 3, 4, 5]);
        expect(raisedEvents).toEqual(['itemAdded']);

        collection.shift();
        expect(collection.toArray()).toEqual([3, 4, 5]);
        expect(raisedEvents).toEqual(['itemAdded', 'itemAdded.removalCallback']);
    });
});