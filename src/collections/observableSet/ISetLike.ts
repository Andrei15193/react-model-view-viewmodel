/**
 * Represents a read-only set-like object based on the [Set-like](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set#set-like_objects) interface.
 * @template TItem The type of items the set contains.
 */
export interface ISetLike<TItem> {
    /**
     * Gets the number of items in the collection.
     * @see [Set.size](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/size)
     */
    readonly size: number;

    /**
     * Gets an iterator that provides each element in the collection, this is an alias for {@linkcode values}
     * @returns An iterator going over each key in the collection.
     * @see [Set.keys](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/keys)
     */
    keys(): IterableIterator<TItem>;

    /**
     * Checks whether the provided item is in the collection.
     * @param item The item to search for.
     * @returns Returns `true` if the provided item is found in the collection; otherwise `false`.
     * @see [Set.has](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set/has)
     */
    has(item: TItem): boolean;
}