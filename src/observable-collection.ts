import type { ICollectionChange, IEvent, INotifyCollectionChanged, INotifyPropertiesChanged } from './events';
import { DispatchEvent } from './events';

/** Represents a read-only observable collection based on the read-only array interface.
 * @template TItem - The type of items the collection contains.
 */
export interface IReadOnlyObservableCollection<TItem> extends Readonly<TItem[]>, INotifyPropertiesChanged, INotifyCollectionChanged<TItem> {
}

/** Represents an observable collection based on the array interface.
 * @template TItem - The type of items the collection contains.
 */
export interface IObservableCollection<TItem> extends IReadOnlyObservableCollection<TItem> {
    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     */
    push(...items: readonly TItem[]): number;

    /** Removes the last element from the collection and returns it. If the collection is empty, undefined is returned. */
    pop(): TItem | undefined;

    /** Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     */
    unshift(...items: readonly TItem[]): number;

    /** Removes the first element from the collection and returns it. If the collection is empty, undefined is returned. */
    shift(): TItem | undefined;

    /** Gets the item at the provided index.
     * @param index - The index from which to retrieve an item.
     */
    get(index: number): TItem;

    /** Sets the provided item at the provided index.
     * @param index - The index to which to set the item.
     * @param item - The item to set.
     */
    set(index: number, item: TItem): void;

    /** Removes elements from the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    splice(start: number, deleteCount?: number): TItem[];

    /** Clears the contents of the collection and returns the removed items, similar to calling splice(0, collection.length). */
    clear(): TItem[];

    /** Resets the contents of the collection by clearing it and setting the provided items. Returns the new length of the collection.
     * @param items - The new content of the collection.
     */
    reset(...items: readonly TItem[]): number;
}

/** Creates an observable collection containing the provided items.
 * @param items - The items to initialize the collection with.
 */
export function observableCollection<TItem>(...items: readonly TItem[]): IObservableCollection<TItem> {
    return new ObservableCollection<TItem>(...items);
}

class ObservableCollection<TItem> extends Array<TItem> implements IObservableCollection<TItem> {
    private readonly _propertiesChangedEvent: DispatchEvent<readonly string[]>;
    private readonly _collectionChangedEvent: DispatchEvent<ICollectionChange<TItem>>;

    public constructor(...items: readonly TItem[]) {
        super();
        super.push(...items);
        this.propertiesChanged = this._propertiesChangedEvent = new DispatchEvent<readonly string[]>();
        this.collectionChanged = this._collectionChangedEvent = new DispatchEvent<ICollectionChange<TItem>>();
    }

    public readonly propertiesChanged: IEvent<readonly string[]>;

    public readonly collectionChanged: IEvent<ICollectionChange<TItem>>;

    public push = (...items: readonly TItem[]): number => {
        const addedItems = new Array(this.length).concat(items);
        const result = super.push(...items);
        this._collectionChangedEvent.dispatch(this, { addedItems, removedItems: [] });
        this._propertiesChangedEvent.dispatch(this, ['length']);
        return result;
    }

    public pop = (): TItem | undefined => {
        if (this.length > 0) {
            const removedItem = super.pop() as TItem;
            const removedItems = new Array(this.length).concat(removedItem);
            this._collectionChangedEvent.dispatch(this, { addedItems: [], removedItems });
            this._propertiesChangedEvent.dispatch(this, ['length']);
            return removedItem;
        }
        else
            return undefined;
    }

    public unshift = (...items: readonly TItem[]): number => {
        const result = super.unshift(...items);
        this._collectionChangedEvent.dispatch(this, { addedItems: items, removedItems: [] });
        this._propertiesChangedEvent.dispatch(this, ['length']);
        return result;
    }

    public shift = (): TItem | undefined => {
        if (this.length > 0) {
            const removedItem = super.shift() as TItem;
            this._collectionChangedEvent.dispatch(this, { addedItems: [], removedItems: [removedItem] });
            this._propertiesChangedEvent.dispatch(this, ['length']);
            return removedItem;
        }
        else
            return undefined;
    }

    public get = (index: number): TItem => {
        if (index < 0 || index >= this.length)
            throw new RangeError("The index is outside the bounds of the collection.");

        return this[index];
    }

    public set = (index: number, item: TItem): void => {
        if (index < 0 || index >= this.length)
            throw new RangeError("The index is outside the bounds of the collection.");

        const offset = new Array(index);
        const removedItems = offset.concat(this[index]);
        const addedItems = offset.concat(item);
        this[index] = item;
        this._collectionChangedEvent.dispatch(this, { addedItems, removedItems });
    }

    public splice = (start: number, deleteCount?: number): TItem[] => {
        if (this.length > 0) {
            const removedItems = super.splice(start, deleteCount);
            this._collectionChangedEvent.dispatch(this, { addedItems: [], removedItems: new Array(start).concat(removedItems) });
            this._propertiesChangedEvent.dispatch(this, ['length']);
            return removedItems;
        }
        else
            return [];
    }

    public clear = (): TItem[] => {
        if (this.length > 0) {
            const removedItems = super.splice(0);
            this._collectionChangedEvent.dispatch(this, { addedItems: [], removedItems });
            this._propertiesChangedEvent.dispatch(this, ['length']);
            return removedItems;
        }
        else
            return [];
    }

    public reset = (...items: readonly TItem[]): number => {
        const previousLength = this.length;
        const removedItems = super.splice(0);
        super.push(...items);
        this._collectionChangedEvent.dispatch(this, { addedItems: items, removedItems });
        if (previousLength !== this.length)
            this._propertiesChangedEvent.dispatch(this, ['length']);

        return this.length;
    }
}