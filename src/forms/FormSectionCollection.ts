import type { IConfigurableFormSectionCollection } from './IConfigurableFormSectionCollection';
import type { Form } from './Form';
import { ReadOnlyFormSectionCollection } from './ReadOnlyFormSectionCollection';

export class FormSectionCollection<TSection extends Form<TValidationError>, TValidationError = string> extends ReadOnlyFormSectionCollection<TSection, TValidationError> implements IConfigurableFormSectionCollection<TSection, TValidationError> {
    /**
     * Initializes a new instance of the {@link FormSectionCollection} class.
     * @param sections The items to initialize the collection with.
     */
    public constructor(sections?: Iterable<TSection>) {
        super(sections);
    }

    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    public get length(): number {
        return super.length;
    }

    /**
     * Gets or sets the number of items in the collection.
     * @see [Array.length](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/length)
     */
    public set length(value: number) {
        super.length = value;
    }

    /**
     * Appends new elements to the end of the collection, and returns the new length of the collection.
     * @param items New elements to add at the end of the collection.
     * @returns The new length of the collection.
     * @see [Array.push](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     */
    public push(...items: readonly TSection[]): number {
        return super.push.apply(this, arguments);
    }

    /**
     * Removes the last element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The last element in the collection that was removed.
     * @see [Array.pop](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
     */
    public pop(): TSection | undefined {
        return super.pop.apply(this, arguments);
    }

    /**
     * Inserts new elements at the start of the collection, and returns the new length of the collection.
     * @param items Elements to insert at the start of the collection.
     * @returns The new length of the collection.
     * @see [Array.unshift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     */
    public unshift(...items: readonly TSection[]): number {
        return super.unshift.apply(this, arguments);
    }

    /**
     * Removes the first element from the collection and returns it. If the collection is empty, `undefined` is returned.
     * @returns The first element in the collection that was removed.
     * @see [Array.shift](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
     */
    public shift(): TSection | undefined {
        return super.shift.apply(this, arguments);
    }

    /**
     * Gets the item at the provided index.
     * @param index The index from which to retrieve an item.
     * @returns The item at the provided index.
     * @see [Array.at](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
     */
    public get(index: number): TSection {
        return super.get.apply(this, arguments);
    }

    /**
     * Sets the provided item at the provided index.
     * @param index The index to which to set the item.
     * @param item The item to set.
     * @returns The length of the collection.
     */
    public set(index: number, item: TSection): number {
        return super.set.apply(this, arguments);
    }

    /**
     * Removes and/or adds elements to the collection and returns the deleted elements.
     * @param start The zero-based location in the collection from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items The items to insert at the given start location.
     * @returns An array containing the elements that were deleted.
     * @see [Array.splice](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     */
    public splice(start: number, deleteCount?: number, ...items: readonly TSection[]): TSection[] {
        return super.splice.apply(this, arguments);
    }

    /**
     * Reverses the items in the collections and returns the observable collection.
     * @param compareCallback Optional, a callback used to determine the sort order between two items.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
     */
    public sort(compareCallback?: (left: Exclude<TSection, undefined>, right: Exclude<TSection, undefined>) => number): this {
        return super.sort.apply(this, arguments);
    }

    /**
     * Reverses the items in the collections and returns the observable collection..
     * @returns The observable collection on which the operation is performed.
     * @see [Array.reverse](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
     */
    public reverse(): this {
        return super.reverse.apply(this, arguments);
    }

    /**
     * Copies items inside the collection overwriting existing ones.
     * @param target The index at which to start copying items, accepts both positive and negative values.
     * @param start The index from which to start copying items, accepts both positive and negative values.
     * @param end The index until where to copy items, accepts both positive and negative values.
     * @see [Array.copyWithin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
     */
    public copyWithin(target: number, start: number, end?: number): this {
        return super.copyWithin.apply(this, arguments);
    }

    /**
     * Fills the collection with the provided `item`.
     * @param item The item to fill the collection with.
     * @param start The index from which to start filling the collection, accepts both positive and negative values.
     * @param end The index until which to fill the collection, accepts both positive and negative values.
     * @returns The observable collection on which the operation is performed.
     * @see [Array.fill](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
     */
    public fill(item: TSection, start?: number, end?: number): this {
        return super.fill.apply(this, arguments);
    }
}