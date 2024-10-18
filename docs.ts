import { Application, CommentDisplayPart, DeclarationReflection, ParameterReflection, ReferenceType, Reflection, ReflectionKind, ReflectionSymbolId, SignatureReflection, SomeType, TypeParameterReflection } from 'typedoc';
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
            if (declaration.variant === 'declaration')
                switch (declaration.kind) {
                    case ReflectionKind.TypeAlias:
                    case ReflectionKind.Interface:
                    case ReflectionKind.Class:
                    case ReflectionKind.Constructor:
                    case ReflectionKind.Property:
                    case ReflectionKind.Accessor:
                    case ReflectionKind.Method:
                    case ReflectionKind.Function:
                        declarationsById.set(declaration.id, declaration);
                        if (declaration.children && declaration.children.length > 0)
                            toVisit.push(...declaration.children);
                        break;

                    default:
                        console.warn(`Skipped '${declaration}' declaration.`);
                }
        }

        const documentationIndex = getDocumentationIndex();

        const outputDirectory = await mkdirAsync(path.join(__dirname, 'docs'), { recursive: true });

        await writeFileAsync(path.join(outputDirectory, 'index.md'), getLandingPage());
        await writeFileAsync(path.join(outputDirectory, '_Sidebar.md'), getSidebar());

        getClassDocumentation

        if (project.children)
            await Promise.all(project.children.map(async declaration => {
                const subDirectory1 = declaration.sources?.at(0)?.fileName.split('/').at(0);
                let subDirectory2: string;
                let documentation: string | null = null;
                switch (declaration.kind) {
                    case ReflectionKind.TypeAlias:
                        subDirectory2 = 'aliases';
                        documentation = getAliasDocumentation(declaration);
                        break;

                    case ReflectionKind.Interface:
                        subDirectory2 = 'interfaces';
                        documentation = getInterfaceDocumentation(declaration);
                        break;

                    case ReflectionKind.Class:
                        subDirectory2 = 'classes';
                        documentation = getClassDocumentation(declaration);
                        break;

                    case ReflectionKind.Function:
                        subDirectory2 = 'functions';
                        documentation = getFunctionDocumentation(declaration);
                        break;
                }

                if (documentation !== null) {
                    const directoryPath = path.join(outputDirectory, subDirectory1!, subDirectory2!);

                    await mkdirAsync(directoryPath, { recursive: true });
                    await writeFileAsync(path.join(directoryPath, `${getIdentifier(declaration)}.md`), documentation);
                }
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

        function getDocumentationIndex(): IDocumentationIndex {
            function getNamespaceSortOrder(namespaceId: string): number {
                switch (namespaceId) {
                    case 'events':
                        return 1;

                    case 'viewModels':
                        return 2;

                    case 'forms':
                        return 3;

                    case 'validation':
                        return 4;
                    case 'validation/triggers':
                        return 6;

                    case 'collections/observableCollections':
                        return 7;
                    case 'collections/observableMap':
                        return 8;
                    case 'collections/observableSet':
                        return 9;

                    case 'dependencies':
                        return 10;

                    case 'hooks':
                        return 11;

                    default:
                        return 1000;
                }
            }

            function getNamespaceDisplayName(namespaceId: string): string {
                switch (namespaceId) {
                    case 'events':
                        return 'Events';

                    case 'viewModels':
                        return 'ViewModels';

                    case 'forms':
                        return 'Forms';

                    case 'validation':
                        return 'Validation';
                    case 'validation/triggers':
                        return 'Validation / Triggers';

                    case 'collections/observableCollections':
                        return 'Observable Collection';
                    case 'collections/observableMap':
                        return 'Observable Map';
                    case 'collections/observableSet':
                        return 'Observable Set';

                    case 'dependencies':
                        return 'Dependency Handling';

                    case 'hooks':
                        return 'React Hooks';

                    default:
                        throw new Error(`Unhandled '${namespaceId}' namespace ID.`);
                }
            }

            function getModuleSortOrder(module: IModuleDeclarationIndex): number {
                if (module.declarations.every(declaration => declaration.kind === ReflectionKind.TypeAlias))
                    return 1;
                if (module.declarations.every(declaration => declaration.kind === ReflectionKind.Interface))
                    return 2;
                if (module.declarations.every(declaration => declaration.kind === ReflectionKind.TypeAlias || declaration.kind === ReflectionKind.Interface))
                    return 3;

                return 1000;
            }

            function getDeclarationSortOrder(declaration: DeclarationReflection): number {
                switch (declaration.kind) {
                    case ReflectionKind.Interface:
                        return 1;

                    case ReflectionKind.TypeAlias:
                        return 2;

                    case ReflectionKind.Class:
                        return 3;

                    case ReflectionKind.Function:
                        return 4;

                    default:
                        return 1000;
                }
            }

            function getDeclarationPromotionSortOrder(declaration: DeclarationReflection): number | null {
                switch (declaration.name) {
                    case 'IEvent':
                        return 1;
                    case 'IEventHandler':
                        return 2;
                    case 'EventDispatcher':
                        return 3;

                    case 'INotifyPropertiesChanged':
                        return 1;
                    case 'ViewModel':
                        return 2;

                    case 'Form':
                        return 1;
                    case 'IFormFieldConfig':
                        return 2;
                    case 'FormField':
                        return 3;
                    case 'ReadOnlyFormCollection':
                        return 4;
                    case 'FormCollection':
                        return 5;
                    case 'IConfigurableFormCollection':
                        return 6;
                    case 'FormSetupCallback':
                        return 7;

                    case 'IValidator':
                        return 1;
                    case 'ValidatorCallback':
                        return 2;
                    case 'IObjectValidator':
                        return 3;
                    case 'IValidatable':
                        return 4;

                    case 'WellKnownValidationTrigger':
                        return 1;
                    case 'ValidationTrigger':
                        return 2;

                    case 'ReadOnlyObservableCollection':
                        return 1;
                    case 'ObservableCollection':
                        return 2;
                    case 'INotifyCollectionChanged':
                        return 3;
                    case 'CollectionChangeOperation':
                        return 4;
                    case 'INotifyCollectionReordered':
                        return 5;
                    case 'CollectionReorderOperation':
                        return 6;

                    case 'ReadOnlyObservableMap':
                        return 1;
                    case 'ObservableMap':
                        return 2;
                    case 'INotifyMapChanged':
                        return 3;
                    case 'MapChangeOperation':
                        return 4;

                    case 'ReadOnlyObservableSet':
                        return 1;
                    case 'ObservableSet':
                        return 2;
                    case 'INotifySetChanged':
                        return 3;
                    case 'SetChangeOperation':
                        return 4;

                    case 'IDependencyResolver':
                        return 1;
                    case 'IDependencyContainer':
                        return 2;
                    case 'DependencyContainer':
                        return 3;
                    case 'useDependency':
                        return 4;
                    case 'useViewModelDependency':
                        return 5;
                    case 'useDependencyResolver':
                        return 6;

                    case 'useViewModel':
                        return 1;
                    case 'useViewModelMemo':
                        return 2;
                    case 'useObservableCollection':
                        return 3;
                    case 'useObservableMap':
                        return 4;
                    case 'useObservableSet':
                        return 5;

                    default:
                        return null;
                }
            }

            const declarationIndex: IDeclarationIndex = {
                namespaces: Array
                    .from(declarationsById.values())
                    .filter(declaration => {
                        switch (declaration.kind) {
                            case ReflectionKind.TypeAlias:
                            case ReflectionKind.Interface:
                            case ReflectionKind.Class:
                            case ReflectionKind.Function:
                                return true;

                            default:
                                return false;
                        }
                    })
                    .reduce(
                        (namespaces, declaration) => {
                            let namespaceId = declaration.sources?.at(0)?.fileName.split('/').slice(0, -1).join('/')!;
                            if (namespaceId === 'validation/objectValidator')
                                namespaceId = 'validation';

                            const moduleId = declaration.sources?.at(0)?.fileName!;
                            let namespace = namespaces.find(namespace => namespace.id === namespaceId);
                            if (!namespace) {
                                namespace = {
                                    id: namespaceId,
                                    modules: []
                                };
                                namespaces.push(namespace);
                            }

                            let module = namespace.modules.find(module => module.id === moduleId);
                            if (!module) {
                                module = {
                                    id: moduleId,
                                    declarations: []
                                };
                                namespace.modules.push(module);
                            }

                            module.declarations.push(declaration)

                            return namespaces;
                        },
                        new Array<INamespaceDeclarationIndex>()
                    )
                    .sort((left, right) => getNamespaceSortOrder(left.id) - getNamespaceSortOrder(right.id))
                    .map(namespace => {
                        namespace
                            .modules
                            .sort((left, right) => getModuleSortOrder(left) - getModuleSortOrder(right))
                            .forEach(module => {
                                module.declarations.sort((left, right) => getDeclarationSortOrder(left) - getDeclarationSortOrder(right))
                            });

                        return namespace;
                    })
            }

            const documentationIndex: IDocumentationIndex = {
                namespaces: declarationIndex
                    .namespaces
                    .map(namespace => ({
                        name: getNamespaceDisplayName(namespace.id),
                        declarations: namespace
                            .modules
                            .reduce(
                                (declarations, module) => declarations.concat(module.declarations),
                                new Array<DeclarationReflection>()
                            )
                            .map(declaration => Object.assign({}, declaration, { promoted: getDeclarationPromotionSortOrder(declaration) !== null }))
                            .sort((left, right) => {
                                const leftSortOrder = getDeclarationPromotionSortOrder(left);
                                const rightSortOrder = getDeclarationPromotionSortOrder(right);

                                if (leftSortOrder === null)
                                    return rightSortOrder === null ? 0 : 1;
                                else if (rightSortOrder === null)
                                    return -1;
                                else
                                    return leftSortOrder - rightSortOrder;
                            })
                    }))
            };

            return documentationIndex;
        }

        function getLandingPage(): string {
            return '### API\n\n' + documentationIndex
                .namespaces
                .map(namespace => {
                    let listMarker = '*';

                    return `* **${namespace.name}**\n` + namespace
                        .declarations
                        .map((declaration, declarationIndex, declarations) => {
                            if (declarationIndex > 0 && declarations[declarationIndex - 1].promoted !== declarations[declarationIndex].promoted)
                                listMarker = '-';

                            return `  ${listMarker} [${getSimpleName(declaration)}](${getIdentifier(declaration)})`;
                        })
                        .join('\n');
                })
                .join('\n');
        }

        function getSidebar(): string {
            return (
                '**[Motivation](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#motivation)**  \n'
                + '**[Overview](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#overview)**  \n'
                + '**[Guides and Tutorials - Getting Started](https://github.com/Andrei15193/react-model-view-viewmodel/discussions/7)**  \n'
                + '**[Releases](https://github.com/Andrei15193/react-model-view-viewmodel/releases)**\n'
                + '\n'
                + '**[API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api)**  \n'
                + documentationIndex
                    .namespaces
                    .map(namespace => {
                        return `**${namespace.name}**  \n` + namespace
                            .declarations
                            .filter(declaration => declaration.promoted)
                            .map(declaration => `[${getSimpleName(declaration)}](${getIdentifier(declaration)})`)
                            .join('  \n');
                    })
                    .join('\n\n')
            );
        }

        function getAliasDocumentation(aliasDeclaration: DeclarationReflection): string {
            return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${getFullName(aliasDeclaration)} alias

${getDeprecationNotice(aliasDeclaration)}

${getSummary(aliasDeclaration)}

\`\`\`ts
${getDeclaration(aliasDeclaration)}
\`\`\`

${getSourceCodeLink(aliasDeclaration)}

${getGenericParameters(aliasDeclaration)}

${getDescription(aliasDeclaration)}

${getRemarks(aliasDeclaration)}

${getGuidance(aliasDeclaration)}

${getReferences(aliasDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
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

${getGenericParameters(interfaceDeclaration)}

${getDescription(interfaceDeclaration)}

${getRemarks(interfaceDeclaration)}

${getConstructorsList(interfaceDeclaration)}

${getPropertiesList(interfaceDeclaration)}

${getMethodsList(interfaceDeclaration)}

${getGuidance(interfaceDeclaration)}

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

${getGenericParameters(classDeclaration)}

${getDescription(classDeclaration)}

${getRemarks(classDeclaration)}

${getConstructorsList(classDeclaration)}

${getPropertiesList(classDeclaration)}

${getMethodsList(classDeclaration)}

${getGuidance(classDeclaration)}

${getReferences(classDeclaration)}
`.replace(/\n{3,}/g, '\n\n').trim();
        }

        function getFunctionDocumentation(functionDeclaration: DeclarationReflection): string {
            return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${getFullName(functionDeclaration)} ${functionDeclaration.name.startsWith('use') ? 'hook' : 'function'}

${functionDeclaration.signatures && functionDeclaration.signatures.length > 1 ? `This ${functionDeclaration.name.startsWith('use') ? 'hook' : 'function'} has multiple overloads.\n\n----\n\n` : ''}

${(functionDeclaration.signatures || []).map(getFunctionSignatureDocumentation).join('\n\n----\n\n')}
`.replace(/\n{3,}/g, '\n\n').trim();
        }

        function getFunctionSignatureDocumentation(functionSignature: SignatureReflection): string {
            return `
${getDeprecationNotice(functionSignature)}

${getSummary(functionSignature)}

\`\`\`ts
${getDeclaration(functionSignature)}
\`\`\`

${getSourceCodeLink(functionSignature)}

${getGenericParameters(functionSignature)}

${getParameters(functionSignature)}

${getReturn(functionSignature)}

${getDescription(functionSignature)}

${getRemarks(functionSignature)}

${getGuidance(functionSignature)}

${getReferences(functionSignature)}
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
                case ReflectionKind.TypeAlias:
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

                case ReflectionKind.TypeAlias:
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

        function getDeclaration(declaration: DeclarationReflection | SignatureReflection): string {
            switch (declaration.kind) {
                case ReflectionKind.TypeAlias:
                    let aliasDeclaration = `type ${declaration.name}`;

                    if (declaration.typeParameters && declaration.typeParameters.length > 0)
                        aliasDeclaration += `<${declaration.typeParameters.map(getTypeParameterDeclaration).join(', ')}>`;

                    switch (declaration.type?.type) {
                        case 'union':
                            return aliasDeclaration
                                + '\n= '
                                + declaration
                                    .type
                                    .types
                                    .map(type => {
                                        if (type.type === 'tuple')
                                            return `[\n    ${type.elements.map(getTypeReferenceDeclaration).join(',\n    ')}\n  ]`;
                                        else
                                            return getTypeReferenceDeclaration(type);
                                    })
                                    .join('\n| ')
                                + ';';

                        case 'reflection':
                            if (
                                declaration.type.declaration.kind === ReflectionKind.TypeLiteral
                                && declaration.type.declaration.signatures
                                && declaration.type.declaration.signatures.length === 1
                                && declaration.type.declaration.signatures.at(0)!.name === declaration.type.declaration.name
                            )
                                return aliasDeclaration + '\n  = ' + getTypeReferenceDeclaration(declaration.type!) + ';';
                            else
                                return aliasDeclaration + ' = ' + getTypeReferenceDeclaration(declaration.type!) + ';';

                        case 'indexedAccess':
                            return aliasDeclaration + '\n  = ' + getTypeReferenceDeclaration(declaration.type!) + ';';

                        default:
                            throw new Error(`Unhandled '${declaration.type?.type}' declaration type.`);
                    }

                case ReflectionKind.Interface:
                    let interfaceDeclaration = `interface ${declaration.name}`;

                    if (declaration.typeParameters && declaration.typeParameters.length > 0)
                        interfaceDeclaration += `<${declaration.typeParameters.map(getTypeParameterDeclaration).join(', ')}>`;
                    if (declaration.extendedTypes && declaration.extendedTypes.length > 0)
                        interfaceDeclaration += `\n    extends ${declaration.extendedTypes.map(getTypeReferenceDeclaration).join(', ')}`;

                    return interfaceDeclaration;

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

                case ReflectionKind.CallSignature:
                    let functionDeclaration = 'function ' + declaration.name;

                    if (declaration.typeParameters && declaration.typeParameters.length > 0)
                        functionDeclaration += `<${declaration.typeParameters.map(getTypeParameterDeclaration).join(', ')}>`;

                    const paramters = (declaration as SignatureReflection)?.parameters || [];
                    if (paramters.length > 0) {
                        functionDeclaration += '(\n  ';
                        functionDeclaration += ((declaration as SignatureReflection)?.parameters || [])
                            .map(getParameterDeclaration)
                            .join(',\n  ');
                        functionDeclaration += '\n)';
                    }
                    else
                        functionDeclaration += '()';

                    if (declaration.type)
                        functionDeclaration += ': ' + getTypeReferenceDeclaration(declaration.type);

                    return functionDeclaration;

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

        function getParameterDeclaration(parameter: ParameterReflection): string {
            let declaration = parameter.name;

            if (parameter.flags.isOptional)
                declaration += '?'
            declaration += ': '

            declaration += getTypeReferenceDeclaration(parameter.type!);

            if (parameter.defaultValue)
                declaration += ' = ' + parameter.defaultValue;

            return declaration;
        }

        function getTypeReferenceDeclaration(typeReference: SomeType): string {
            switch (typeReference.type) {
                case 'reference':
                    return `${typeReference.name}${typeReference.typeArguments && typeReference.typeArguments.length > 0 ? `<${typeReference.typeArguments.map(getTypeReferenceDeclaration).join(', ')}>` : ''}`;

                case 'reflection':
                    switch (typeReference.declaration.kind) {
                        case ReflectionKind.TypeAlias:
                        case ReflectionKind.Class:
                        case ReflectionKind.Interface:
                            let typeReferenceDeclaration = typeReference.declaration.name;
                            if (typeReference.declaration.typeParameters && typeReference.declaration.typeParameters.length > 0) {
                                typeReferenceDeclaration += '<';
                                typeReferenceDeclaration += typeReference
                                    .declaration
                                    .typeParameters
                                    .map(genericParameter => getTypeReferenceDeclaration(genericParameter.type!))
                                    .join(', ');
                                typeReferenceDeclaration += '>';
                            }

                            return typeReferenceDeclaration;

                        case ReflectionKind.TypeLiteral:
                            if (typeReference.declaration.type)
                                return getTypeReferenceDeclaration(typeReference.declaration.type);
                            else if (typeReference.declaration.signatures) {
                                if (typeReference.declaration.signatures.length === 1 && typeReference.declaration.signatures.at(0)!.name === typeReference.declaration.name) {
                                    const signature = typeReference.declaration.signatures.at(0)!
                                    return `(${(signature.parameters || []).map(getParameterDeclaration).join(', ')}) => ${getTypeReferenceDeclaration(signature.type!)}`;
                                }
                                else {
                                    let signaturesDeclarations = '{\n  ';
                                    signaturesDeclarations += typeReference
                                        .declaration
                                        .signatures
                                        .map(signature => {
                                            if (signature.kind === ReflectionKind.ConstructorSignature)
                                                return `new (${(signature.parameters || []).map(getParameterDeclaration).join(', ')}): ${getTypeReferenceDeclaration(signature.type!)};`;
                                            else {
                                                const genericTypeDeclaration = signature.typeParameters?.map(getTypeParameterDeclaration).join(', ') || '';
                                                return `${signature.name}${genericTypeDeclaration.length > 0 ? '<' + genericTypeDeclaration + '>' : ''}(${(signature.parameters || []).map(getParameterDeclaration).join(', ')}): ${getTypeReferenceDeclaration(signature.type!)};`;
                                            }
                                        })
                                        .join('\n  ');
                                    signaturesDeclarations += '\n}';

                                    return signaturesDeclarations;
                                }
                            }
                            else
                                throw new Error(`Unhandled '${typeReference.declaration}' type literal reflection reference declaration.`);

                        case ReflectionKind.IndexSignature:
                            return typeReference.declaration.name;

                        default:
                            throw new Error(`Unhandled '${typeReference.declaration}' reflection reference declaration.`);
                    }

                case 'intersection':
                    return typeReference.types.map(getTypeReferenceDeclaration).join(' | ');

                case 'union':
                    return typeReference.types.map(getTypeReferenceDeclaration).join(' | ');

                case 'intrinsic':
                    return typeReference.name;

                case 'literal':
                    if (typeReference.value === null)
                        return 'null';
                    else switch (typeof typeReference.value) {
                        case 'string':
                            return `"${typeReference.value}"`;

                        case 'number':
                        case 'bigint':
                        case 'boolean':
                            return typeReference.value.toString();

                        default:
                            throw new Error(`Unhandled '${typeReference.value}' literal value.`);
                    }

                case 'tuple':
                    return `[${typeReference.elements.map(getTypeReferenceDeclaration).join(', ')}]`;

                case 'typeOperator':
                    return `${typeReference.operator} ${getTypeReferenceDeclaration(typeReference.target)}`;

                case 'array':
                    switch (typeReference.elementType.type) {
                        case 'reference':
                        case 'reflection':
                        case 'literal':
                        case 'intrinsic':
                            return `${getTypeReferenceDeclaration(typeReference.elementType)}[]`;

                        default:
                            return `(${getTypeReferenceDeclaration(typeReference.elementType)})[]`;
                    }

                case 'predicate':
                    if (typeReference.targetType)
                        return `${typeReference.name} is ${getTypeReferenceDeclaration(typeReference.targetType)}`;
                    else
                        throw new Error('Unhandled predicate type declaration.');

                case 'indexedAccess':
                    return getTypeReferenceDeclaration(typeReference.objectType) + `[${getTypeReferenceDeclaration(typeReference.indexType)}]`;

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
                        case 'Exclude':
                            return 'https://www.typescriptlang.org/docs/handbook/utility-types.html#excludeuniontype-excludedmembers';

                        case 'Iterable':
                            return 'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol';

                        case 'ArrayLike':
                            return 'https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections#working_with_array-like_objects';

                        default:
                            throw new Error(`Could not determine URL for TypeScript reference '${typeReference.name}'.`);
                    }

                case '@types/react':
                    switch (typeReference.name) {
                        case 'PropsWithChildren':
                            return 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children';

                        case 'DependencyList':
                            return 'https://react.dev/learn/removing-effect-dependencies#dependencies-should-match-the-code';

                        case 'JSX.Element':
                            return 'https://react.dev/learn/writing-markup-with-jsx';

                        default:
                            throw new Error(`Could not determine URL for React reference '${typeReference.name}'.`);
                    }


                default:
                    throw new Error(`Could not determine URL for '${typeReference}' in package '${typeReference.package}'.`);
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

                    case 'union':
                        return typeReference.types.map(getReferenceLink).join(' | ');

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
                            case 'reflection':
                            case 'literal':
                            case 'intrinsic':
                                return `${getReferenceLink(typeReference.elementType)}[]`;

                            default:
                                return `(${getReferenceLink(typeReference.elementType)})[]`;
                        }

                    case 'intrinsic':
                        switch (typeReference.name) {
                            case 'undefined':
                                return '[`undefined`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)';

                            case 'string':
                                return '[`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)';

                            case 'unknown':
                                return '[`unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)';

                            case 'any':
                                return '[`any`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)';

                            case 'void':
                                return '[`void`](https://www.typescriptlang.org/docs/handbook/2/functions.html#void)';

                            default:
                                throw new Error(`'Unhandled '${typeReference.name}' intrinsic type reference.'`);
                        }

                    case 'literal':
                        switch (typeReference.value) {
                            case null:
                                return '[`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)';

                            default:
                                throw new Error(`Unhandled '${typeReference.value}' literal value.`);
                        }

                    case 'predicate':
                        if (typeReference.targetType)
                            return `\`${typeReference.name}\` is ${getReferenceLink(typeReference.targetType)}`;
                        else
                            throw new Error('Unhandled predicate type reference.');

                    default:
                        throw new Error(`Unhandled '${typeReference.type}' type reference for '${typeReference}'.`);
                }
            }
            catch (error) {
                throw new Error(`Could not get a reference link for '${typeReference}'.\n${error}`)
            }
        }

        function getDeprecationNotice(declaration: DeclarationReflection | SignatureReflection): string {
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

        function getSummary(declaration: DeclarationReflection | SignatureReflection): string {
            try {
                if (
                    'signatures' in declaration
                    && declaration.signatures
                    && declaration.signatures.length > 0
                    && declaration.signatures.at(0)!.comment
                    && declaration.signatures.at(0)!.comment!.summary)
                    return getBlock(declaration.signatures.at(0)!.comment!.summary);
                else if (declaration.comment && declaration.comment.summary)
                    return getBlock(declaration.comment.summary);
                else
                    return '';
            }
            catch (error) {
                throw new Error(`Could not process '${declaration}' declaration summary.\n${error}`);
            }
        }

        function getDescription(declaration: DeclarationReflection | SignatureReflection): string {
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

        function getRemarks(declaration: DeclarationReflection | SignatureReflection): string {
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

        function getGuidance(declaration: DeclarationReflection | SignatureReflection): string {
            const examples = declaration.comment?.blockTags.filter(blockTag => blockTag.tag === '@guidance') || [];

            return examples
                .map(example => {
                    const [title, ...content] = getBlock(example.content).split('\n');
                    return `### Guidance: ${title.trim()}\n\n${content.join('\n').trim()}`;
                })
                .join('\n');
        }

        function getGenericParameters(declaration: DeclarationReflection | SignatureReflection): string {
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

        function getParameters(declaration: SignatureReflection): string {
            if (declaration.parameters && declaration.parameters.length > 0) {
                return '### Parameters\n\n' + declaration
                    .parameters
                    .map(
                        parameterDeclaration => {
                            let parameter = `* **${parameterDeclaration.name}**: ${getReferenceLink(parameterDeclaration.type!)}`;
                            let parameterDescription = getBlock(parameterDeclaration.comment?.summary);

                            if (parameterDescription.length > 0)
                                parameter += '  \n' + parameterDescription;

                            if (parameterDeclaration.defaultValue)
                                parameter += `\n\n  Default value: \`${parameterDeclaration.defaultValue}\`.`;

                            return parameter;
                        },
                    ).join('\n\n');
            }
            else
                return '';
        }

        function getReturn(declaration: SignatureReflection): string {
            if (declaration.type) {
                let returnDocumentation = `### Returns: ${getReferenceLink(declaration.type)}`;
                const returnDescription = getBlock(declaration.comment?.blockTags.find(blocKTag => blocKTag.tag === '@returns')?.content);
                if (returnDescription.length > 0)
                    returnDocumentation += '\n\n' + returnDescription;

                return returnDocumentation;
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

        function getReferences(declaration: DeclarationReflection | SignatureReflection): string {
            const references = declaration.comment?.blockTags.filter(blockTag => blockTag.tag === '@see') || [];
            if (references.length > 0)
                return '### See also\n\n' + references.map(reference => getBlock(reference.content).replace(/^[ \t]-/gm, '*')).join('\n');
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
                                    if (declarationReference.resolutionStart === 'global')
                                        switch (declarationReference.moduleSource) {
                                            case 'typescript':
                                                const typeScriptReference = declarationReference.symbolReference?.path?.map(componentPath => componentPath.path).join('.') || '';
                                                switch (typeScriptReference) {
                                                    case 'String':
                                                        return `[${getDisplayText('String')}](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)`;
                                                }

                                            case '@types/react':
                                                switch (declarationReference.symbolReference?.path?.at(-1)!.path) {
                                                    case 'useMemo':
                                                        return `[${getDisplayText('useMemo')}](https://react.dev/reference/react/useMemo)`;

                                                    default:
                                                        throw new Error(`Unhandled '${comment.target}' React reference.`);
                                                }
                                        }
                                }

                                const reflectionTarget = comment.target as Reflection;
                                if (reflectionTarget.kind === ReflectionKind.TypeParameter)
                                    return getDisplayText(reflectionTarget.name);

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
                throw new Error(`Could not process '${comment}' comment\n${error}`);
            }
        }

        function getSourceCodeLink(declaration: DeclarationReflection | SignatureReflection): string {
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

interface IDocumentationIndex {
    readonly namespaces: readonly INamespaceDocumentationIndex[];
}

interface INamespaceDocumentationIndex {
    readonly name: string;
    readonly declarations: readonly (DeclarationReflection & { readonly promoted: boolean })[];
}

interface IDeclarationIndex {
    readonly namespaces: readonly INamespaceDeclarationIndex[];
}

interface INamespaceDeclarationIndex {
    readonly id: string;
    readonly modules: IModuleDeclarationIndex[];
}

interface IModuleDeclarationIndex {
    readonly id: string;
    readonly declarations: DeclarationReflection[];
}