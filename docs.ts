import { type DeclarationReflection, Application, ReflectionKind } from 'typedoc';
import fs, { type MakeDirectoryOptions, type WriteFileOptions } from 'fs';
import path from 'path';

void async function () {
    try {
        const application = await Application.bootstrap();

        const project = await application.convert();
        if (!project)
            throw 'Could not parse project';

        const outputDirectory = await mkdirAsync(path.join(__dirname, 'docs'), { recursive: true });
        await writeFileAsync(path.join(outputDirectory, 'index.md'), '### Test');

        if (project.children)
            Promise.all(project.children.map(async declaration => {
                switch (declaration.kind) {
                    case ReflectionKind.Class:
                        await writeFileAsync(path.join(outputDirectory, `${declaration.name}.md`), writeClassDeclaration(declaration));
                        break;
                }
            }))
    }
    catch (error) {
        console.error(error);
    }

    function writeClassDeclaration(classDeclaration: DeclarationReflection): string {
        return `## ${classDeclaration.name} Class`;
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