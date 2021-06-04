import type { DetailedHTMLProps, InputHTMLAttributes, FocusEvent, FocusEventHandler } from 'react';
import type { IFormFieldViewModel } from '../form-field-view-model';
import React, { useEffect, useRef, useCallback } from 'react';
import { watchEvent } from '../hooks/watch-event';

interface IHtmlElementProps extends HTMLInputElement {
    focus(): void;

    blur(): void;
}

/** Represents the Input component props, extends the HTML input props. */
export interface IInputProps<TValue> extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    /** The field to bind the focus events to. */
    readonly field: IFormFieldViewModel<TValue>;
}

/** A helper component for binding the focus events to the field.
 * @template TValue - The type of values the field contains.
 */
export function Input<TValue>({ field, onBlur, onFocus, ...other }: IInputProps<TValue>): JSX.Element {
    const input = useRef<IHtmlElementProps>();
    const isHandlingFocusEvent = useRef(false);

    const onFocusHandler: FocusEventHandler<HTMLInputElement> = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            onFocus && onFocus(event);
            if (!isHandlingFocusEvent.current) {
                isHandlingFocusEvent.current = true;
                try {
                    field.isFocused = true;
                }
                finally {
                    isHandlingFocusEvent.current = false;
                }
            }
        },
        [input, onFocus]
    );

    const onBlurHandler: FocusEventHandler<HTMLInputElement> = useCallback(
        (event: FocusEvent<HTMLInputElement>): void => {
            onBlur && onBlur(event);
            if (!isHandlingFocusEvent.current) {
                isHandlingFocusEvent.current = true;
                try {
                    field.isFocused = false;
                }
                finally {
                    isHandlingFocusEvent.current = false;
                }
            }
        },
        [input, onBlur]
    );

    watchEvent(field && field.propertiesChanged, (_, changedProperties) => {
        if (!isHandlingFocusEvent.current && changedProperties.indexOf('isFocused') >= 0)
            if (field.isFocused)
                input.current.focus();
            else
                input.current.blur();
    });

    useEffect(
        () => {
            if (field.isFocused)
                input.current.focus();
            else
                input.current.blur();
        },
        []
    );

    return (
        <input ref={input} onFocus={onFocusHandler} onBlur={onBlurHandler} {...other} />
    );
}