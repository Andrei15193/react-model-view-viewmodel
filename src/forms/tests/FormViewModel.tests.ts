import type { IObservableCollection, IReadOnlyObservableCollection } from '../../collections';
import { FormFieldViewModel } from '../FormFieldViewModel';
import { FormSectionCollection } from '../FormSectionCollection';
import { FormViewModel } from '../FormViewModel';

describe('FormViewModel', (): void => {
    it('adding fields when initializing collections adds them to the form', (): void => {
        const form = new TestFormViewModel();
        const field1 = new FormFieldViewModel({ name: 'field 1', initialValue: {} });
        const field2 = new FormFieldViewModel({ name: 'field 2', initialValue: {} });

        form.withFields(field1, field2);

        expect(form.fields.length).toBe(2);
        expect(form.fields.toArray()).toEqual([field1, field2]);
    });

    it('adding fields to field collections adds them to the form', (): void => {
        const form = new TestFormViewModel();
        const field1 = new FormFieldViewModel({ name: 'field 1', initialValue: {} });
        const field2 = new FormFieldViewModel({ name: 'field 2', initialValue: {} });

        const fields = form.withFields();
        fields.push(field1, field2);

        expect(form.fields.length).toBe(2);
        expect(form.fields.toArray()).toEqual([field1, field2]);
    });

    it('initializing two field collections adds all to the form', (): void => {
        const form = new TestFormViewModel();
        const field1 = new FormFieldViewModel({ name: 'field 1', initialValue: {} });
        const field2 = new FormFieldViewModel({ name: 'field 2', initialValue: {} });

        form.withFields(field1);
        form.withFields(field2);

        expect(form.fields.length).toBe(2);
        expect(form.fields.toArray()).toEqual([field1, field2]);
    });

    it('changing field collections keeps the entire collection in sync', (): void => {
        const form = new TestFormViewModel();
        function expectFields(fields: readonly FormFieldViewModel<unknown>[]) {
            expect(form.fields.length).toBe(fields.length);
            expect(form.fields.toArray().map(({ name }) => ({ name }))).toEqual(fields.map(({ name }) => ({ name })));
        }

        const field1 = new FormFieldViewModel({ name: 'field 1', initialValue: {} });
        const field2 = new FormFieldViewModel({ name: 'field 2', initialValue: {} });
        const field3 = new FormFieldViewModel({ name: 'field 3', initialValue: {} });
        const field4 = new FormFieldViewModel({ name: 'field 4', initialValue: {} });
        const field5 = new FormFieldViewModel({ name: 'field 5', initialValue: {} });
        const field6 = new FormFieldViewModel({ name: 'field 6', initialValue: {} });
        const field7 = new FormFieldViewModel({ name: 'field 7', initialValue: {} });
        const field8 = new FormFieldViewModel({ name: 'field 8', initialValue: {} });
        const field9 = new FormFieldViewModel({ name: 'field 9', initialValue: {} });
        const field10 = new FormFieldViewModel({ name: 'field 10', initialValue: {} });

        const fieldCollection1 = form.withFields(field1, field2, field3);
        const fieldCollection2 = form.withFields(field4, field5, field6, field7);
        const fieldCollection3 = form.withFields(field8, field9, field10);
        expectFields([field1, field2, field3, field4, field5, field6, field7, field8, field9, field10]);

        fieldCollection2.reverse();
        expectFields([field1, field2, field3, field7, field6, field5, field4, field8, field9, field10]);

        fieldCollection1.sort((left, right) => -left.name.localeCompare(right.name));
        expectFields([field3, field2, field1, field7, field6, field5, field4, field8, field9, field10]);

        const [removedField] = fieldCollection3.splice(1, 1);
        expect(removedField).toEqual(field9);
        expectFields([field3, field2, field1, field7, field6, field5, field4, field8, field10]);

        fieldCollection1.push(removedField);
        expectFields([field3, field2, field1, field9, field7, field6, field5, field4, field8, field10]);

        fieldCollection3.push(...fieldCollection1);
        expectFields([field3, field2, field1, field9, field7, field6, field5, field4, field8, field10, field3, field2, field1, field9]);

        fieldCollection2.splice(0);
        expectFields([field3, field2, field1, field9, field8, field10, field3, field2, field1, field9]);

        fieldCollection3.reverse();
        expectFields([field3, field2, field1, field9, field9, field1, field2, field3, field10, field8]);
    });

    it('removing a form field resets it', () => {
        let resetInvocationCount = 0;
        const form = new TestFormViewModel();
        const field = new FormFieldViewModel({ name: 'field', initialValue: null });
        field.reset = () => {
            resetInvocationCount++;
        };

        const sectionCollection = form.withFields(field);
        expect(resetInvocationCount).toBe(0);

        sectionCollection.splice(0);
        expect(resetInvocationCount).toBe(1);
    });

    it('adding sections when initializing collections adds them to the form', (): void => {
        const form = new TestFormViewModel();
        const section1 = new FormViewModel();
        const section2 = new FormViewModel();

        form.withSections(section1, section2);

        expect(form.sections.length).toBe(2);
        expect(form.sections.toArray()).toEqual([section1, section2]);
    });

    it('adding sections to section collections adds them to the form', (): void => {
        const form = new TestFormViewModel();
        const section1 = new FormViewModel();
        const section2 = new FormViewModel();

        const sections = form.withSections();
        sections.push(section1, section2);

        expect(form.sections.length).toBe(2);
        expect(form.sections.toArray()).toEqual([section1, section2]);
    });

    it('initializing two section collections adds all to the form', (): void => {
        const form = new TestFormViewModel();
        const section1 = new FormViewModel();
        const section2 = new FormViewModel();

        form.withSections(section1);
        form.withSections(section2);

        expect(form.sections.length).toBe(2);
        expect(form.sections.toArray()).toEqual([section1, section2]);
    });

    it('changing section collections keeps the entire collection in sync', (): void => {
        const form = new TestFormViewModel();
        function expectSections(sections: readonly FormViewModel<unknown>[]) {
            expect(form.sections.length).toBe(sections.length);
            expect(form.sections.toArray()).toEqual(sections);
        }

        const section1 = new FormViewModel();
        const section2 = new FormViewModel();
        const section3 = new FormViewModel();
        const section4 = new FormViewModel();
        const section5 = new FormViewModel();
        const section6 = new FormViewModel();
        const section7 = new FormViewModel();
        const section8 = new FormViewModel();
        const section9 = new FormViewModel();
        const section10 = new FormViewModel();

        const sectionCollection1 = form.withSections(section1, section2, section3);
        const sectionCollection2 = form.withSections(section4, section5, section6, section7);
        const sectionCollection3 = form.withSections(section8, section9, section10);
        expectSections([section1, section2, section3, section4, section5, section6, section7, section8, section9, section10]);

        sectionCollection2.reverse();
        expectSections([section1, section2, section3, section7, section6, section5, section4, section8, section9, section10]);

        const [removedSection] = sectionCollection3.splice(1, 1);
        expect(removedSection).toEqual(section9);
        expectSections([section1, section2, section3, section7, section6, section5, section4, section8, section10]);

        sectionCollection1.push(removedSection);
        expectSections([section1, section2, section3, section9, section7, section6, section5, section4, section8, section10]);

        sectionCollection3.push(...sectionCollection1);
        expectSections([section1, section2, section3, section9, section7, section6, section5, section4, section8, section10, section1, section2, section3, section9]);

        sectionCollection2.splice(0);
        expectSections([section1, section2, section3, section9, section8, section10, section1, section2, section3, section9]);

        sectionCollection3.reverse();
        expectSections([section1, section2, section3, section9, section9, section3, section2, section1, section10, section8]);
    });

    it('removing a form section resets it', () => {
        let resetInvocationCount = 0;
        const form = new TestFormViewModel();
        const section = new FormViewModel();
        section.reset = () => {
            resetInvocationCount++;
        };

        const sectionCollection = form.withSections(section);
        expect(resetInvocationCount).toBe(0);

        sectionCollection.splice(0);
        expect(resetInvocationCount).toBe(1);
    });

    it('invalidating a field makes the entire form invalid', (): void => {
        const form = new TestFormViewModel();
        const [field] = form.withFields(new FormFieldViewModel({
            name: 'field',
            initialValue: null
        }));

        field.error = 'invalid';

        expect(form.isValid).toBeFalsy();
        expect(form.isInvalid).toBeTruthy();
    });

    it('invalidating a field propagates property change notifications', (): void => {
        let invocationCount = 0;
        const form = new TestFormViewModel();
        form.propertiesChanged.subscribe({
            handle(_, changedProperties) {
                invocationCount++;
                expect(changedProperties.length).toBe(2);
                expect(changedProperties).toContain('isValid');
                expect(changedProperties).toContain('isInvalid');
            }
        })
        const field = new FormFieldViewModel({
            name: 'field',
            initialValue: null
        });
        form.withFields(field);

        field.error = 'invalid';

        expect(invocationCount).toBe(1);
    });

    it('invalidating a section makes the entire form invalid', (): void => {
        const form = new TestFormViewModel();
        const [section] = form.withSections(
            new FormViewModel()
        );

        section.error = 'invalid';

        expect(form.isValid).toBeFalsy();
        expect(form.isInvalid).toBeTruthy();
    });

    it('invalidating a section propagates property change notifications', (): void => {
        let invocationCount = 0;
        const form = new TestFormViewModel();
        form.propertiesChanged.subscribe({
            handle(_, changedProperties) {
                invocationCount++;
                expect(changedProperties.length).toBe(2);
                expect(changedProperties).toContain('isValid');
                expect(changedProperties).toContain('isInvalid');
            }
        })
        const [section] = form.withSections(
            new FormViewModel()
        );

        section.error = 'invalid';

        expect(invocationCount).toBe(1);
    });

    it('configuring a form section collection initializes each added section', () => {
        let invocationCount = 0;
        const form = new TestFormViewModel();
        const sectionCollection = form.withSections();
        const formSection = new FormViewModel();
        sectionCollection.withItemSetup(
            section => {
                invocationCount++;
                expect(section).toStrictEqual(formSection);
            }
        );

        sectionCollection.push(formSection);

        expect(invocationCount).toBe(1);
    });

    it('removing a configuration callback reconfigures the section', () => {
        let setup1InvocationCount = 0;
        let setup2InvocationCount = 0;
        let resetInvocationCount = 0;
        const form = new TestFormViewModel();
        const sectionCollection = form.withSections();
        const formSection = new FormViewModel();
        formSection.reset = () => {
            resetInvocationCount++;
        }

        const setup1 = (section: FormViewModel) => {
            setup1InvocationCount++;
            expect(section).toStrictEqual(formSection);
        };
        const setup2 = (section: FormViewModel) => {
            setup2InvocationCount++;
            expect(section).toStrictEqual(formSection);
        };
        sectionCollection.withItemSetup(setup1);
        sectionCollection.withItemSetup(setup2);

        sectionCollection.push(formSection);

        sectionCollection.withoutItemSetup(setup2);

        expect(setup1InvocationCount).toBe(2);
        expect(resetInvocationCount).toBe(1);
        expect(setup2InvocationCount).toBe(1);
    });

    it('clearing configuration callbacks resets the section', () => {
        let resetInvocationCount = 0;
        const form = new TestFormViewModel();
        const sectionCollection = form.withSections();
        const formSection = new FormViewModel();
        formSection.reset = () => {
            resetInvocationCount++;
        }
        sectionCollection.withItemSetup(() => { });

        sectionCollection.push(formSection);
        sectionCollection.clearItemSetups();

        expect(resetInvocationCount).toBe(1);
    });

    it('resetting a form section resets fields, sections and sections collection configurations', () => {
        let fieldResetInvocationCount = 0;
        let sectionResetInvocationCount = 0;
        let sectionSetupInvocationCount = 0;

        const form = new TestFormViewModel();
        form.validation.add(() => 'error', [form]);
        const field = new FormFieldViewModel({ name: 'field', initialValue: null });
        field.reset = () => { fieldResetInvocationCount++; };
        form.withFields(field);
        const formSection = new FormViewModel();
        formSection.reset = () => { sectionResetInvocationCount++; }
        const formSectionsCollection = form.withSections(formSection);
        formSectionsCollection.withItemSetup(
            () => { sectionSetupInvocationCount++; }
        );

        expect(fieldResetInvocationCount).toBe(0);
        expect(sectionResetInvocationCount).toBe(0);
        expect(sectionSetupInvocationCount).toBe(1);
        expect(form.error).toBe('error');
        expect(form.isValid).toBeFalsy();
        expect(form.isInvalid).toBeTruthy();
        expect(form.validation.validators.length).toBe(1);
        expect(form.validation.triggers.size).toBe(1);

        form.reset();
        formSectionsCollection.push(new FormViewModel());

        expect(fieldResetInvocationCount).toBe(1);
        expect(sectionResetInvocationCount).toBe(1);
        expect(sectionSetupInvocationCount).toBe(1);
        expect(form.error).toBeNull();
        expect(form.isValid).toBeTruthy();
        expect(form.isInvalid).toBeFalsy();
        expect(form.validation.validators.length).toBe(0);
        expect(form.validation.triggers.size).toBe(0);
    });
});

class TestFormViewModel<TValidationError = string> extends FormViewModel<TValidationError> {
    public withFields<TField extends FormFieldViewModel<unknown, TValidationError> = FormFieldViewModel<unknown, TValidationError>>(...fields: readonly TField[]): IObservableCollection<TField> {
        return super.withFields.apply(this, arguments);
    }

    public withSections<TSection extends FormViewModel<TValidationError> = FormViewModel<TValidationError>>(...sections: readonly TSection[]): FormSectionCollection<TSection, TValidationError> {
        return super.withSections.apply(this, arguments);
    }
}