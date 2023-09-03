import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { Input } from '../../src/components/input';
import { FormFieldViewModel } from '../../src/form-field-view-model';

describe('watch-event/useViewModelType', (): void => {
    it('component passes props', (): void => {
        const field = new FormFieldViewModel('test-field', 0);
        const { getByDisplayValue } = render(<Input field={field} defaultValue="test" />);

        expect(getByDisplayValue('test')).is.not.undefined;
    });

    it('focusing input focuses field', (): void => {
        const field = new FormFieldViewModel('test-field', 0);
        const { getByDisplayValue } = render(<Input field={field} defaultValue="test" />);

        getByDisplayValue('test').focus();

        expect(field.isFocused).to.be.true;
    });

    it('focusing field focuses input', (): void => {
        const field = new FormFieldViewModel('test-field', 0);
        const { getByDisplayValue } = render(<Input field={field} defaultValue="test" />);

        field.isFocused = true;

        expect(document.activeElement).is.equal(getByDisplayValue('test'));
    });

    it('bluring input de-focuses field', (): void => {
        const field = new FormFieldViewModel('test-field', 0);
        const { getByDisplayValue } = render(<Input field={field} defaultValue="test" />);
        getByDisplayValue('test').focus();
        expect(field.isFocused).to.be.true;

        getByDisplayValue('test').blur();

        expect(field.isFocused).to.be.false;
    });

    it('de-focusing field blurs input', (): void => {
        const field = new FormFieldViewModel('test-field', 0);
        const { getByDisplayValue } = render(<Input field={field} defaultValue="test" />);
        field.isFocused = true;

        field.isFocused = false;


        expect(document.activeElement).is.not.equal(getByDisplayValue('test'));
    });

    it('passing focused field focuses input', (): void => {
        const field = new FormFieldViewModel('test-field', 0);
        field.isFocused = true;

        const { getByDisplayValue } = render(<Input field={field} defaultValue="test" />);

        expect(document.activeElement).is.equal(getByDisplayValue('test'));
    });
});