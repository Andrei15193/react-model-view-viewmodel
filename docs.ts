import { Application, CommentDisplayPart, DeclarationReflection, Reflection, ReflectionKind, ReflectionSymbolId } from 'typedoc';
import fs, { type MakeDirectoryOptions, type WriteFileOptions } from 'fs';
import path from 'path';

void async function () {
    try {
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
            Promise.all(project.children.map(async declaration => {
                switch (declaration.kind) {
                    case ReflectionKind.Class:
                        await writeFileAsync(path.join(outputDirectory, `${declaration.name}.md`), writeClassDeclaration(declaration, declarationsById));
                        break;
                }
            }))
    }
    catch (error) {
        console.error(error);
    }

    function findDeclaration(target: Reflection | ReflectionSymbolId | string | undefined, declarationsById: Map<number, DeclarationReflection>): DeclarationReflection {
        const declaration = declarationsById.get(
            (target as any)?.id
            || (target as any)?.getStableKey()
            || Number(target)
        );
        if (declaration === null || declaration === undefined)
            throw new Error(`Cannot find declaration with id '${target}'.`);

        return declaration;
    }

    function writeClassDeclaration(classDeclaration: DeclarationReflection, declarationsById: Map<number, DeclarationReflection>): string {
        return `
###### [API](https://github.com/Andrei15193/react-model-view-viewmodel/wiki#api) / ${getName(classDeclaration)} class

${getSummary(classDeclaration, declarationsById)}

## ${classDeclaration.name} Class
`.trim();
    }

    function getName(declaration: DeclarationReflection): string {
        if (declaration.typeParameters && declaration.typeParameters.length > 0)
            return `${declaration.name}\\<${declaration.typeParameters.map(typeParameter => typeParameter.name).join(', ')}\\>`;
        else
            return declaration.name;
    }

    function getSummary(declaration: DeclarationReflection, declarationsById: Map<number, DeclarationReflection>): string {
        if (declaration.comment && declaration.comment.summary)
            return getBlock(declaration.comment.summary, declarationsById);
        else
            return '';
    }

    function getBlock(comments: readonly CommentDisplayPart[], declarationsById: Map<number, DeclarationReflection>): string {
        return comments.reduce((result, comment) => result + getCommentMarkdown(comment, declarationsById), '');
    }

    function getCommentMarkdown(comment: CommentDisplayPart, declarationsById: Map<number, DeclarationReflection>): string {
        switch (comment.kind) {
            case 'text':
                return comment.text;

            case 'code':
                return `\`${comment.text}\``;

            case 'inline-tag':
                switch (comment.tag) {
                    case '@link':
                    case '@linkcode':
                        const targetDeclaration = findDeclaration(comment.target, declarationsById);
                        return `[${getName(targetDeclaration)}](https://github.com/Andrei15193/react-model-view-viewmodel/wiki/${targetDeclaration.name})`;

                    default:
                        throw new Error(`Unhandled '${comment.tag}' inline-tag.`);
                }

            default:
                throw new Error(`Unhandled '${comment.kind}' comment kind.`);
        }
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
}();