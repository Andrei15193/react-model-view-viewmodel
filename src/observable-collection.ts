import type { ICollectionChange, IEvent, INotifyCollectionChanged, INotifyPropertiesChanged } from './events';
import { DispatchEvent } from './events';

/** A read-only interface for observable collections based on the read-only interface of an array. */
export interface IReadOnlyObservableCollection<TItem> extends Readonly<TItem[]>, INotifyPropertiesChanged, INotifyCollectionChanged<TItem> {
}

/** An interface for observable collections based on the read-only interface of an array. The provided operations are the same as an array with a one or two exceptions.
 * The purpose is to use an observable collection the same way an array is being used.
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

    /** Removes elements from the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    splice(start: number, deleteCount?: number): TItem[];

    /** Clears the contents of the collection, similar to calling splice(0, collection.length). */
    clear(): void;

    /** Resets the contents of the collection by clearing it and setting the provided items.
     * @param items - The new content of the collection.
     */
    reset(...items: readonly TItem[]): void;
}

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
        this.colllectionChanged = this._collectionChangedEvent = new DispatchEvent<ICollectionChange<TItem>>();
    }

    public readonly propertiesChanged: IEvent<readonly string[]>;

    public readonly colllectionChanged: IEvent<ICollectionChange<TItem>>;

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

    public clear = (): void => {
        if (this.length > 0) {
            const removedItems = super.splice(0);
            this._collectionChangedEvent.dispatch(this, { addedItems: [], removedItems });
            this._propertiesChangedEvent.dispatch(this, ['length']);
        }
    }

    public reset = (...items: readonly TItem[]): void => {
        const previousLength = this.length;
        const removedItems = super.splice(0);
        super.push(...items);
        this._collectionChangedEvent.dispatch(this, { addedItems: items, removedItems });
        if (previousLength !== this.length)
            this._propertiesChangedEvent.dispatch(this, ['length']);
    }
}