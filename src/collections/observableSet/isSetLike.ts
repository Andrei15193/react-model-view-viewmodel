import type { ISetLike } from "./ISetLike";

export function isSetLike<TItem>(maybeSetLike: any): maybeSetLike is ISetLike<TItem> {
    return (
        typeof maybeSetLike.size === "number"
        && typeof maybeSetLike.has === "function"
        && typeof maybeSetLike.keys === "function"
    );
}