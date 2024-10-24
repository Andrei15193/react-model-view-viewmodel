import type { ISetLike } from './ISetLike';
import type { IReadOnlyObservableSet } from './IReadOnlyObservableSet';
import type { ISetChange } from './ISetChange';
import type { ISetChangedEvent } from './ISetChangedEvent';
import { EventDispatcher } from '../../events';
import { ViewModel } from '../../viewModels';
import { isSetLike } from './isSetLike';

/**
 * Represents a read-only observable set based on the [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set) interface.
 * @template TItem The type of items the set contains.
 */
export class ReadOnlyObservableSet<TItem> extends ViewModel implements IReadOnlyObservableSet<TItem> {
    private _changeToken: number;
    private readonly _set: Set<TItem>;
    private readonly _setChangedEvent: EventDispatcher<this, ISetChange<TItem>>;

    /**
     * Initializes a new instance of the {@linkcode ReadOnlyObservableSet} class.
     * @param items The items to initialize the set with.
     */
    public constructor(items?: Iterable<TItem>) {
        super();

        this._changeToken = 0;
        this._set = new Set<TItem>(items);
        this.setChanged = this._setChangedEvent = new EventDispatcher<this, ISetChange<TItem>>();
    }

    /**
     * An event that is raised when the set changed by adding or removing items.
     */
    public readonly setChanged: ISetChangedEvent<this, TItem>;

    /**
     * Gets the number of items in the collection.
     * @see [Set.size](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/size)
     */
    public get size(): number {
        return this._set.size;
    }

    /**
     * Gets an iterator that provides each element in the collection.
     * @returns An iterator going over each element in the collection.
     * @see [Set[@@iterator]](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/@@iterator)
     */
    public [Symbol.iterator](): IterableIterator<TItem> {
        return this.values();
    }

    /**
     * Gets an iterator that provides each element in the collection in an item-item tupple. Items in a set are their own key.
     * @returns An iterator going over key-item pairs for each element in the collection.
     * @see [Set.entries](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/entries)
     */
    public entries(): IterableIterator<[TItem, TItem]> {
        var changeTokenCopy = this._changeToken;
        return new ObservableSetIterator<[TItem, TItem]>(this._set.entries(), () => changeTokenCopy !== this._changeToken);
    }

    /**
     * Gets an iterator that provides each element in the collection, this is an alias for {@linkcode values}
     * @returns An iterator going over each key in the collection.
     * @see [Set.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/keys)
     */
    public keys(): IterableIterator<TItem> {
        return this.values();
    }

    /**
     * Gets an iterator that provides each item in the collection.
     * @returns An iterator going over each item in the collection.
     * @see [Set.values](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/values)
     */
    public values(): IterableIterator<TItem> {
        var changeTokenCopy = this._changeToken;
        return new ObservableSetIterator<TItem>(this._set[Symbol.iterator](), () => changeTokenCopy !== this._changeToken);
    }

    /**
     * Checks whether the provided item is in the collection.
     * @param item The item to search for.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Set.has](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/has)
     */
    public has(item: TItem): boolean {
        return this._set.has(item);
    }

    /**
     * Checks whether there are no items common in both the current set and the provided collection.
     * @param other The collection whose items to check.
     * @returns Returns `true` if there are no items common in both the current set and the provided collection; otherwise `false`.
     * @see [Set.isDisjointFrom](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/isDisjointFrom)
     */
    public isDisjointFrom(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): boolean {
        if (other === null || other === undefined || this.size === 0)
            return true;
        else {
            for (const item of (isSetLike(other) ? other.keys() : other))
                if (this.has(item))
                    return false;

            return true;
        }
    }

    /**
     * Checks whether all items from the current set are contained by the provided collection.
     * @param other The collection whose items to check.
     * @returns Returns `true` if all items in the current set are found in the provided collection; otherwise `false`.
     * @see [Set.isSubsetOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/isSubsetOf)
     */
    public isSubsetOf(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): boolean {
        if (other === null || other === undefined)
            return false;

        if (this.size === 0)
            return true;

        const checkingSet = isSetLike(other) ? other : new Set(other);
        if (checkingSet.size < this.size)
            return false;

        for (const item of this)
            if (!checkingSet.has(item))
                return false;

        return true;
    }

    /**
     * Checks whether all items from the provided collection are contained by the current set.
     * @param other The collection whose items to check.
     * @returns Returns `true` if all items from the provided collection are found in the current set; otherwise `false`.
     * @see [Set.isSupersetOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/isSupersetOf)
     */
    public isSupersetOf(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): boolean {
        if (other === null || other === undefined)
            return false;

        for (const item of (isSetLike(other) ? other.keys() : other))
            if (!this.has(item))
                return false;

        return true;
    }

    /**
     * Generates a set that contains all items in the current one, but not in the provided collection.
     * @param other The collection whose items to exclude from the result.
     * @returns Returns a new set containing all items in the current one, but not in the provided collection.
     * @see [Set.difference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/difference)
     */
    public difference(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem> {
        const result = new Set<TItem>(this);

        if (other !== null && other !== undefined)
            for (const item of (isSetLike(other) ? other.keys() : other))
                result.delete(item);

        return result;
    }

    /**
     * Generates a set that contains the items contained by both the current and provided collection.
     * @param other The collection whose items to check.
     * @returns Returns a set that contains the items contained by both the current and provided collection.
     * @see [Set.intersection](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection)
     */
    public intersection(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem> {
        const result = new Set<TItem>();

        if (other !== null && other !== undefined)
            for (const item of (isSetLike(other) ? other.keys() : other))
                if (this.has(item))
                    result.add(item);

        return result;
    }

    /**
     * Generates a set that contains all items from both the current and the provided collection.
     * @param other The collection whose items to check.
     * @returns Returns a new set containing all items from both the current and the provided collection.
     * @see [Set.union](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/union)
     */
    public union(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem> {
        const result = new Set<TItem>(this);

        if (other !== null && other !== undefined)
            for (const item of (isSetLike(other) ? other.keys() : other))
                result.add(item);

        return result;
    }

    /**
     * Generates a set that contains all items from both the current and provided collection, but are not contained by both.
     * @param other The collection whose items to check.
     * @returns Returns a new set containing all items from both the current and provided collection, but not contained by both.
     * @see [Set.symmetricDifference](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference)
     */
    public symmetricDifference(other: Set<TItem> | ISetLike<TItem> | Iterable<TItem>): Set<TItem> {
        if (other === null || other === undefined)
            return new Set<TItem>(this);
        else if (this.size === 0)
            return new Set<TItem>(isSetLike(other) ? other.keys() : other);
        else {
            const result = new Set<TItem>();

            const commonItems = new Set<TItem>();
            for (const item of (isSetLike(other) ? other.keys() : other))
                if (!this.has(item))
                    result.add(item);
                else
                    commonItems.add(item);

            for (const item of this)
                if (!commonItems.has(item))
                    result.add(item);

            return result;
        }
    }

    /**
     * Iterates over the entire collections executing the `callback` for each.
     * @template TContext The context type in which the callback is executed.
     * @param callback The callback processing each item.
     * @param thisArg A value to use as context when processing items.
     * @see [Set.forEach](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach)
     */
    public forEach<TContext>(callback: (this: TContext, item: TItem, key: TItem, set: this) => void, thisArg?: TContext): void {
        const changeTokenCopy = this._changeToken;

        for (const item of this) {
            callback.call(thisArg, item, item, this);

            if (changeTokenCopy !== this._changeToken)
                throw new Error('Set has changed while being iterated.');
        }
    }

    /**
     * Converts the observable set to a native JavaScript [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set).
     * @returns A [Set](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set) containing all the items in the collection.
     */
    public toSet(): Set<TItem> {
        return new Set<TItem>(this);
    }

    /**
     * Ensures the provided `item` is in the set. There can be at most only one instance of an item in a set at any given time.
     * @param item The item to add to the set.
     * @returns The observable set on which the operation is performed.
     * @see [Set.add](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/add)
     */
    protected add(item: TItem): this {
        const previousSize = this.size;

        this._set.add(item);
        if (previousSize !== this.size) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;
            this._setChangedEvent.dispatch(this, {
                operation: 'add',
                addedItems: [item],
                removedItems: []
            });
            this.notifyPropertiesChanged('size');
        }

        return this;
    }

    /**
     * Ensures the provided `item` is not in the set.
     * @param item The item to remove from the set.
     * @returns Returns `true` if the provided item was found and removed from the set; otherwise `false`.
     * @see [Set.delete](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/delete)
     */
    protected delete(item: TItem): boolean {
        if (this._set.delete(item)) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;
            this._setChangedEvent.dispatch(this, {
                operation: 'delete',
                addedItems: [],
                removedItems: [item]
            });
            this.notifyPropertiesChanged('size');

            return true;
        }
        else
            return false;
    }

    /**
     * Empties the set of all items.
     * @see [Set.clear](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/clear)
     */
    protected clear(): void {
        if (this._set.size > 0) {
            this._changeToken = (this._changeToken + 1) % Number.MAX_VALUE;

            const removedItems = Array.from(this._set);
            this._set.clear();

            this._setChangedEvent.dispatch(this, {
                operation: 'clear',
                addedItems: [],
                removedItems
            });
            this.notifyPropertiesChanged('size');
        }
    }
}

class ObservableSetIterator<TItem, TValue = TItem> implements Iterator<TValue, TValue, void> {
    private _completed: boolean;
    private readonly _iterator: Iterator<TValue, TValue, void>;
    private readonly _setChanged: () => boolean;

    public constructor(iterator: Iterator<TValue, TValue, void>, setChanged: () => boolean) {
        this._iterator = iterator;
        this._setChanged = setChanged;
    }

    public [Symbol.iterator](): IterableIterator<TValue> & Iterator<TValue, TValue, void> {
        return this;
    }

    public next(): IteratorResult<TValue, TValue> {
        if (this._completed)
            return {
                done: true,
                value: undefined!
            };
        else if (this._setChanged())
            throw new Error('Set has changed while being iterated.');
        else {
            const { done = false, value } = this._iterator.next();

            if (done) {
                this._completed = true;
                return {
                    done: true,
                    value: undefined!
                };
            }
            else
                return {
                    done: false,
                    value
                };
        }
    }

    public return(value?: TValue): IteratorResult<TValue, TValue> {
        this._completed = true;

        return {
            done: true,
            value: value!
        };
    }

    public throw(): IteratorResult<TValue, TValue> {
        this._completed = true;

        return {
            done: true,
            value: undefined!
        };
    }
}