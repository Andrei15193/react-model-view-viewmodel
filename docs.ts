import { Application, CommentDisplayPart, DeclarationReflection, ReferenceType, Reflection, ReflectionKind, ReflectionSymbolId, SomeType, TypeParameterReflection } from 'typedoc';
import fs, { type MakeDirectoryOptions, type WriteFileOptions } from 'fs';
import path from 'path';

void async function () {
    try {
        const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')).toString());
        const application = await Application.bootstrap();

        const project = await application.convert();
        if (!project)
            throw 'Could not parse project';

        const declarationsById = new Map<number, DeclarationReflection>();
        const toVisit = project.children?.slice() || [];
        while (toVisit.length > 0) {
            const declaration = toVisit.shift()!;
            if (declaration.variant === 'declaration') {
                declarationsById.set(declaration.id, declaration);
                if (declaration.children && declaration.children.length > 0)
                    toVisit.push(...declaration.children);
            }
        }

        const outputDirectory = await mkdirAsync(path.join(__dirname, 'docs'), { recursive: true });
        await writeFileAsync(path.join(outputDirectory, 'index.md'), '### Test');

        if (project.children)
            await Promise.all(project.children.map(async declaration => {
                let documentation: string | null = null;
                switch (declaration.kind) {
                    case ReflectionKind.Class:
                        documentation = getClassDocumentation(declaration);
                        break;

                    case ReflectionKind.Interface:
                        documentation = getInterfaceDocumentation(declaration);
                        break;
                }

                if (documentation !== null)
                    await writeFileAsync(path.join(outputDirectory, `${getIdentifier(declaration)}.md`), documentation);
            }));

        function findDeclaration(target: Reflection | ReflectionSymbolId | string | undefined): DeclarationReflection {
            const declaration = declarationsById.get(
                (target as any)?.id
                || (target as any)?.getStableKey()
                || Number(target)
            );
            if (declaration === null || declaration === undefined)
                throw new Error(`Cannot find declaration with id '${JSON.stringify(target)}'.`);

            return declaration;
        }

        function getInterfaceDocumentation(interfaceDeclaration: DeclarationReflection): string {
            return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${getFullName(interfaceDeclaration)} interface

${getDeprecationNotice(interfaceDeclaration)}

${getSummary(interfaceDeclaration)}

${getInheritaceAndImplementations(interfaceDeclaration)}

\`\`\`ts
${getDeclaration(interfaceDeclaration)}
\`\`\`

${getSourceCodeLink(interfaceDeclaration)}

${getTemplateParameters(interfaceDeclaration)}

${getDescription(interfaceDeclaration)}

${getRemarks(interfaceDeclaration)}

${getConstructorsList(interfaceDeclaration)}

${getPropertiesList(interfaceDeclaration)}

${getMethodsList(interfaceDeclaration)}

${getExamples(interfaceDeclaration)}

${getReferences(interfaceDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
        }

        function getClassDocumentation(classDeclaration: DeclarationReflection): string {
            return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${getFullName(classDeclaration)} class

${getDeprecationNotice(classDeclaration)}

${getSummary(classDeclaration)}

${getInheritaceAndImplementations(classDeclaration)}

${classDeclaration.flags.isAbstract ? 'This is an abstract class.' : ''}

\`\`\`ts
${getDeclaration(classDeclaration)}
\`\`\`

${getSourceCodeLink(classDeclaration)}

${getTemplateParameters(classDeclaration)}

${getDescription(classDeclaration)}

${getRemarks(classDeclaration)}

${getConstructorsList(classDeclaration)}

${getPropertiesList(classDeclaration)}

${getMethodsList(classDeclaration)}

${getExamples(classDeclaration)}

${getReferences(classDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
        }

        function getIdentifier(declaration: DeclarationReflection): string {
            switch (declaration.kind) {
                case ReflectionKind.Constructor:
                case ReflectionKind.Property:
                case ReflectionKind.Accessor:
                case ReflectionKind.Method:
                    return declaration.parent!.name + '.' + declaration.name;

                case ReflectionKind.Class:
                case ReflectionKind.Interface:
                case ReflectionKind.TypeParameter:
                case ReflectionKind.Function:
                    return declaration.name;

                default:
                    throw new Error(`Unhandled '${declaration}' declaration when trying to determine identifier.`);
            }
        }

        function getFullName(declaration: DeclarationReflection): string {
            switch (declaration.kind) {
                case ReflectionKind.Constructor:
                case ReflectionKind.Property:
                case ReflectionKind.Accessor:
                case ReflectionKind.Method:
                    return declaration.parent!.name + '.' + getSimpleName(declaration);

                case ReflectionKind.Class:
                case ReflectionKind.Interface:
                case ReflectionKind.Function:
                    return getSimpleName(declaration);

                default:
                    throw new Error(`Unhandled '${declaration}' declaration when trying to determine full name.`);
            }
        }

        function getSimpleName(declaration: DeclarationReflection): string {
            if (declaration.typeParameters && declaration.typeParameters.length > 0)
                return `${declaration.name}\\<${declaration.typeParameters.map(typeParameter => typeParameter.name).join(', ')}\\>`;
            else
                return declaration.name;
        }

        function getInheritaceAndImplementations(declaration: DeclarationReflection): string {
            try {
                let extensions = "";

                if (declaration.extendedTypes && declaration.extendedTypes.length > 0) {
                    extensions += 'Extends ';
                    extensions += declaration.extendedTypes.map(getReferenceLink).join(', ');
                    extensions += '.';
                }

                if (declaration.implementedTypes && declaration.implementedTypes.length > 0) {
                    if (extensions.length > 0)
                        extensions += '  \n';
                    extensions += 'Implements ';
                    extensions += declaration.implementedTypes.map(getReferenceLink).join(', ');
                    extensions += '.';
                }

                return extensions;
            }
            catch (error) {
                throw new Error(`Could not generate inheritance and implementation information for ${declaration}.\n${error}`);
            }
        }

        function getDeclaration(declaration: DeclarationReflection): string {
            switch (declaration.kind) {
                case ReflectionKind.Class:
                    let classDeclaration = `class ${declaration.name}`;

                    if (declaration.flags.isAbstract)
                        classDeclaration = 'abstract ' + classDeclaration;

                    if (declaration.typeParameters && declaration.typeParameters.length > 0)
                        classDeclaration += `<${declaration.typeParameters.map(getTypeParameterDeclaration).join(', ')}>`;
                    if (declaration.extendedTypes && declaration.extendedTypes.length > 0)
                        classDeclaration += `\n    extends ${declaration.extendedTypes.map(getTypeReferenceDeclaration).join(', ')}`;
                    if (declaration.implementedTypes && declaration.implementedTypes.length > 0)
                        classDeclaration += `\n    implements ${declaration.implementedTypes.map(getTypeReferenceDeclaration).join(', ')}`;

                    return classDeclaration;

                case ReflectionKind.Interface:
                    let interfaceDeclaration = `interface ${declaration.name}`;

                    if (declaration.typeParameters && declaration.typeParameters.length > 0)
                        interfaceDeclaration += `<${declaration.typeParameters.map(getTypeParameterDeclaration).join(', ')}>`;
                    if (declaration.extendedTypes && declaration.extendedTypes.length > 0)
                        interfaceDeclaration += `\n    extends ${declaration.extendedTypes.map(getTypeReferenceDeclaration).join(', ')}`;

                    return interfaceDeclaration;

                default:
                    throw new Error(`Unhandled '${declaration.kind}' declaration type.`);
            }
        }

        function getTypeParameterDeclaration(typeParameter: TypeParameterReflection): string {
            let declaration = typeParameter.name;

            if (typeParameter.type)
                declaration += ' extends ' + getTypeReferenceDeclaration(typeParameter.type);
            if (typeParameter.default)
                declaration += ' = ' + getTypeReferenceDeclaration(typeParameter.default);

            return declaration;
        }

        function getTypeReferenceDeclaration(typeReference: SomeType): string {
            switch (typeReference.type) {
                case 'reference':
                    return `${typeReference.name}${typeReference.typeArguments && typeReference.typeArguments.length > 0 ? `<${typeReference.typeArguments.map(getTypeReferenceDeclaration).join(', ')}>` : ''}`;

                case 'intersection':
                    return typeReference.types.map(getTypeReferenceDeclaration).join(' | ');

                case 'intrinsic':
                    return typeReference.name;

                case 'tuple':
                    return `[${typeReference.elements.map(getTypeReferenceDeclaration).join(', ')}]`;

                case 'typeOperator':
                    return `${typeReference.operator} ${getTypeReferenceDeclaration(typeReference.target)}`;

                case 'array':
                    switch (typeReference.elementType.type) {
                        case 'reference':
                        case 'literal':
                        case 'reflection':
                            return `${getTypeReferenceDeclaration(typeReference.elementType)}[]`;

                        default:
                            return `(${getTypeReferenceDeclaration(typeReference.elementType)})[]`;
                    }

                default:
                    throw new Error(`Unhandled '${typeReference.type}' type declaration.`);
            }
        }

        function getReferenceUrl(typeReference: ReferenceType): string {
            switch (typeReference.package) {
                case packageInfo.name:
                    return getProjectReferenceUrl(typeReference);

                case 'typescript':
                    switch (typeReference.name) {
                        case 'Iterable':
                            return 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol';

                        case 'ArrayLike':
                            return 'https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects';

                        default:
                            throw new Error(`Could not determine URL for TypeScript reference '${typeReference.name}'.`);
                    }

                default:
                    throw new Error(`Could not determine URL for '${typeReference}'.`);
            }
        }

        function getProjectReferenceUrl(typeReferenceOrDeclaration: ReferenceType | DeclarationReflection) {
            try {
                let declaration: DeclarationReflection | null = null;
                typeReferenceOrDeclaration.visit({
                    declaration(foundDeclaration) {
                        declaration = foundDeclaration;
                    },
                    reference() {
                        declaration = findDeclaration((typeReferenceOrDeclaration as ReferenceType).reflection)
                    }
                });
                if (declaration !== null)
                    return `${packageInfo.homepage}/${getIdentifier(declaration)}`;
            }
            catch (error) {
                throw new Error(`Could not get project reference url for '${typeReferenceOrDeclaration}').\n${error}`);
            }

            throw new Error(`Unhandled '${typeReferenceOrDeclaration}' reference type.`);
        }

        function getReferenceLink(typeReference: SomeType): string {
            try {
                switch (typeReference.type) {
                    case 'reference':
                        let typeReferenceLink = typeReference.refersToTypeParameter
                            ? `_${typeReference.name}_`
                            : `[${typeReference.name}](${getReferenceUrl(typeReference)})`;

                        if (typeReference.typeArguments && typeReference.typeArguments.length > 0) {
                            typeReferenceLink += '\\<';
                            typeReferenceLink += typeReference.typeArguments.map(getReferenceLink).join(', ');
                            typeReferenceLink += '\\>';
                        }

                        return typeReferenceLink;

                    case 'tuple':
                        return `\\[${typeReference.elements.map(getReferenceLink).join(', ')}\\]`;

                    case 'intersection':
                        return typeReference.types.map(getReferenceLink).join(' & ');

                    case 'typeOperator':
                        let operatorLink: string;
                        switch (typeReference.operator) {
                            case 'readonly':
                                operatorLink = '[`readonly`](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#readonly-and-const)';
                                break;

                            case 'keyof':
                                operatorLink = '[`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)';
                                break;

                            default:
                                throw new Error(`Unhandled '${typeReference.operator}' type operator link.`);
                        }

                        return `${operatorLink} ${getReferenceLink(typeReference.target)}`;

                    case 'array':
                        switch (typeReference.elementType.type) {
                            case 'reference':
                            case 'literal':
                            case 'reflection':
                                return `${getReferenceLink(typeReference.elementType)}[]`;

                            default:
                                return `(${getReferenceLink(typeReference.elementType)})[]`;
                        }

                    case 'intrinsic':
                        switch (typeReference.name) {
                            case 'string':
                                return '[`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)';

                            case 'unknown':
                                return '[`unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)';

                            case 'void':
                                return '[`void`](https://www.typescriptlang.org/docs/handbook/2/functions.html#void)';

                            default:
                                throw new Error(`'Unhandled '${typeReference.name}' intrinsic type reference.'`);
                        }

                    default:
                        throw new Error(`Unhandled '${typeReference.type}' type reference for '${typeReference}'.`);
                }
            }
            catch (error) {
                throw new Error(`Could not get a reference link for '${typeReference}'.\n${error}`)
            }
        }

        function getDeprecationNotice(declaration: DeclarationReflection): string {
            if (declaration.isDeprecated()) {
                let declarationName: string;
                switch (declaration.kind) {
                    case ReflectionKind.Class:
                        declarationName = 'class';
                        break;

                    default:
                        throw new Error(`Unhandled '${declaration.kind}' deprecated declaration.`);
                }

                let deprecationNotice = '\n----\n\n';
                deprecationNotice += `**This ${declarationName} has been deprecated.**`;

                const deprecationDescription = getBlock(declaration.comment?.blockTags.find(blockTag => blockTag.tag === '@deprecated')?.content);
                if (deprecationDescription.length > 0)
                    deprecationNotice += '  \n' + deprecationDescription;

                deprecationNotice += '\n\n----\n';

                return deprecationNotice;
            }
            else
                return '';
        }

        function getSummary(declaration: DeclarationReflection): string {
            try {
                if (declaration.comment && declaration.comment.summary)
                    return getBlock(declaration.comment.summary);
                else if (
                    declaration.signatures
                    && declaration.signatures.length > 0
                    && declaration.signatures.at(0)!.comment
                    && declaration.signatures.at(0)!.comment!.summary)
                    return getBlock(declaration.signatures.at(0)!.comment!.summary);
                else
                    return '';
            }
            catch (error) {
                throw new Error(`Could not process '${declaration}' declaration summary.\n${error}`);
            }
        }

        function getDescription(declaration: DeclarationReflection): string {
            try {
                const description = declaration.comment?.blockTags.find(blockTag => blockTag.tag === '@description');
                if (description !== null && description !== undefined && description.content.length > 0)
                    return '### Description\n\n' + getBlock(description.content);
                else
                    return '';
            }
            catch (error) {
                throw new Error(`Could not process '${declaration}' declaration description.\n${error}`);
            }
        }

        function getRemarks(declaration: DeclarationReflection): string {
            try {
                const remarks = declaration.comment?.blockTags.find(blockTag => blockTag.tag === '@remarks');
                if (remarks !== null && remarks !== undefined && remarks.content.length > 0)
                    return '### Remarks\n\n' + getBlock(remarks.content);
                else
                    return '';
            }
            catch (error) {
                throw new Error(`Could not process '${declaration}' declaration description.\n${error}`);
            }
        }

        function getExamples(declaration: DeclarationReflection): string {
            const examples = declaration.comment?.blockTags.filter(blockTag => blockTag.tag === '@snippet') || [];

            return examples
                .map(example => {
                    const [title, ...content] = getBlock(example.content).split('\n');
                    return `### Example: ${title.trim()}\n\n${content.join('\n').trim()}`;
                })
                .join('\n');
        }

        function getTemplateParameters(declaration: DeclarationReflection): string {
            if (declaration.typeParameters && declaration.typeParameters.length > 0) {
                return '### Generic Parameters\n\n' + declaration
                    .typeParameters
                    .map(
                        typeParameter => {
                            let genericParameter = `* **${typeParameter.name}**`;
                            let genericParameterDescription = getBlock(typeParameter.comment?.summary);

                            if (genericParameterDescription.length > 0)
                                genericParameter += ' - ' + genericParameterDescription;

                            genericParameter += '\n'
                            if (typeParameter.type)
                                genericParameter += `  \n  Type constraints: ${getReferenceLink(typeParameter.type)}.`;

                            if (typeParameter.default)
                                genericParameter += `  \n  Default value: ${getReferenceLink(typeParameter.default)}.`;

                            return genericParameter;
                        },
                    ).join('\n\n');
            }
            else
                return '';
        }

        function getConstructorsList(declaration: DeclarationReflection): string {
            const constructors = declaration
                .children
                ?.filter(childDeclaration => childDeclaration.kind === ReflectionKind.Constructor && !childDeclaration.flags.isInherited && !childDeclaration.flags.isPrivate)
                .sort(sortCompareDeclarations);

            if (constructors !== null && constructors !== undefined && constructors.length > 0) {
                return '### Constructors\n\n' + constructors
                    .map(constructorDeclaration => {
                        const summary = getSummary(constructorDeclaration).split('\n')[0].trim();
                        return `* ${getFlagSummary(constructorDeclaration)}**[${constructorDeclaration.name}](${getProjectReferenceUrl(constructorDeclaration)})**${summary.length > 0 ? ' - ' + summary : ''}`;
                    })
                    .join('\n')
            }
            else
                return '';
        }

        function getPropertiesList(declaration: DeclarationReflection): string {
            const properties = declaration
                .children
                ?.filter(childDeclaration => childDeclaration.kind === ReflectionKind.Property && !childDeclaration.flags.isInherited && !childDeclaration.flags.isPrivate)
                .sort(sortCompareDeclarations);

            if (properties !== null && properties !== undefined && properties.length > 0) {
                return '### Properties\n\n' + properties
                    .map(propertyDeclaration => {
                        const summary = getSummary(propertyDeclaration).split('\n')[0].trim();
                        return `* ${getFlagSummary(propertyDeclaration)}**[${propertyDeclaration.name}](${getProjectReferenceUrl(propertyDeclaration)})**${summary.length > 0 ? ' - ' + summary : ''}`;
                    })
                    .join('\n')
            }
            else
                return '';
        }

        function getMethodsList(declaration: DeclarationReflection): string {
            const methods = declaration
                .children
                ?.filter(childDeclaration => childDeclaration.kind === ReflectionKind.Method && !childDeclaration.flags.isInherited && !childDeclaration.flags.isPrivate)
                .sort(sortCompareDeclarations);

            if (methods !== null && methods !== undefined && methods.length > 0) {
                return '### Methods\n\n' + methods
                    .map(methodDeclaration => {
                        const summary = getSummary(methodDeclaration).split('\n')[0].trim();
                        return `* ${getFlagSummary(methodDeclaration)}**[${methodDeclaration.name}](${getProjectReferenceUrl(methodDeclaration)})**${summary.length > 0 ? ' - ' + summary : ''}`;
                    })
                    .join('\n')
            }
            else
                return '';
        }

        function getFlagSummary(declaration: DeclarationReflection): string {
            return [
                declaration.flags.isStatic && '`static`',
                declaration.flags.isAbstract && '`abstract`',
                declaration.flags.isPrivate && '`private`',
                declaration.flags.isProtected && '`protected`',
                declaration.flags.isReadonly && '`readonly`',
                declaration.flags.isOptional && '`optional`'
            ]
                .filter(value => !!value)
                .join(' ') + ' ';
        }

        function sortCompareDeclarations(left: DeclarationReflection, right: DeclarationReflection): number {
            return (
                getStaticSortOrder(left) - getStaticSortOrder(right)
                || getAccessModifierSortOrder(left) - getAccessModifierSortOrder(right)
                || left.name.localeCompare(right.name, 'en-US')
            );
        }

        function getStaticSortOrder(declaration: DeclarationReflection): number {
            if (declaration.flags.isStatic)
                return 0;

            return 1;
        }

        function getAccessModifierSortOrder(declaration: DeclarationReflection): number {
            if (declaration.flags.isPrivate)
                return 2;
            if (declaration.flags.isProtected)
                return 1;

            return 0;
        }

        function getReferences(declaration: DeclarationReflection): string {
            const references = declaration.comment?.blockTags.filter(blockTag => blockTag.tag === '@see') || [];
            if (references.length > 0)
                return '### See also\n\n' + references.reduce((result, reference) => result + `* ${getBlock(reference.content)}\n`, '');
            else
                return '';
        }

        function getBlock(comments: readonly CommentDisplayPart[] | null | undefined): string {
            if (comments === null || comments === undefined || comments.length === 0)
                return '';

            return comments
                .reduce((result, comment) => result + getCommentMarkdown(comment), '')
                .replace(/^----$/gm, '');
        }

        function getCommentMarkdown(comment: CommentDisplayPart): string {
            try {
                switch (comment.kind) {
                    case 'text':
                        return comment.text;

                    case 'code':
                        return `\`${comment.text}\``;

                    case 'inline-tag':
                        switch (comment.tag) {
                            case '@link':
                            case '@linkcode':
                                const getDisplayText = (text: string): string => (
                                    comment.tag === '@linkcode'
                                        ? `\`${text.replace(/\\(.)/g, '$1')}\``
                                        : text
                                );

                                if (comment.target && 'qualifiedName' in (comment.target as any)) {
                                    const declarationReference = (comment.target as ReflectionSymbolId).toDeclarationReference();
                                    if (declarationReference.resolutionStart === 'global' && declarationReference.moduleSource === 'typescript') {
                                        const typeScriptReference = declarationReference.symbolReference?.path?.map(componentPath => componentPath.path).join('.') || '';
                                        switch (typeScriptReference) {
                                            case 'String':
                                                return `[${getDisplayText('String')}](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)`;
                                        }
                                    }
                                }

                                const targetDeclaration = findDeclaration(comment.target);
                                return `[${getDisplayText(getFullName(targetDeclaration))}](${getProjectReferenceUrl(targetDeclaration)})`;

                            default:
                                throw new Error(`Unhandled '${comment.tag}' inline-tag.`);
                        }

                    default:
                        throw new Error(`Unhandled '${comment.kind}' comment kind.`);
                }
            }
            catch (error) {
                console.log(comment);
                throw new Error(`Could not process '${comment}' comment\n${error}`);
            }
        }

        function getSourceCodeLink(declaration: DeclarationReflection): string {
            if (declaration.sources && declaration.sources.length > 0) {
                const [{ fileName, line }] = declaration.sources;

                return `Source reference: [\`src/${fileName}:${line}\`](${packageInfo.repository.url.split('+').at(-1).split('.git')[0]}/tree/${packageInfo.version}/src/${fileName}#L${line}).`;
            }
            else
                return '';
        }

        function mkdirAsync(path: string, options?: MakeDirectoryOptions & { recursive: true; }): Promise<string> {
            return new Promise<string>((resolve, reject) => fs.mkdir(path, options, error => {
                if (error)
                    reject(error);
                else
                    resolve(path);
            }));
        }

        function writeFileAsync(path: string, contents: string, options: WriteFileOptions = "utf-8"): Promise<void> {
            return new Promise<void>((resolve, reject) => fs.writeFile(path, contents, options, error => {
                if (error)
                    reject(error);
                else
                    resolve();
            }))
        }
    }
    catch (error) {
        console.error(error);
    }
}();