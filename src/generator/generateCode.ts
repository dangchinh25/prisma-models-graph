import { DMMF } from '@prisma/generator-helper';
import path from 'path';
import {
    CompilerOptions,
    Directory,
    ModuleKind,
    Project,
    ScriptTarget,
    SourceFile,
    VariableDeclarationKind
} from 'ts-morph';
import {
    INDEX_FILE_NAME,
    MODELS_GRAPH_FILE_NAME, MODELS_GRAPH_VARIABLE_NAME, TYPE_DIRECTORY_NAME
} from './config';
import { parseDMMFModels } from './helpers';
import { ParsedModels } from './types';

const baseCompilerOptions: CompilerOptions = {
    target: ScriptTarget.ES2022,
    module: ModuleKind.CommonJS,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: true,
    declaration: true
};

const baseDirPath = 'node_modules/@generated/models-graph';

export const generateCode = async (
    dmmf: DMMF.Document
): Promise<void> => {
    const modelsGraph = parseDMMFModels( dmmf.datamodel.models );

    const project = new Project( { compilerOptions: { ...baseCompilerOptions } } );

    const generatedModule = await Promise.all( [
        generateModelsGraphFile(
            project,
            baseDirPath,
            modelsGraph
        )
    ] );

    await generateIndexFile( project, baseDirPath, generatedModule );

    await project.emit();
};

// TODO figure out how to dynamically export type
const generateTypeDirectory = async (
    project: Project,
    baseGeneratedDirPath: string
): Promise<Directory> => {
    const generatedTypeDirectory = project.createDirectory(
        path.resolve( baseGeneratedDirPath, TYPE_DIRECTORY_NAME )
    );

    await generatedTypeDirectory.save();

    return generatedTypeDirectory;
};

const generateModelsGraphFile = async (
    project: Project,
    baseGeneratedDirPath: string,
    modelsGraph: ParsedModels
): Promise<SourceFile> => {
    const modelsGraphSourceFile = project.createSourceFile(
        path.resolve( baseGeneratedDirPath, MODELS_GRAPH_FILE_NAME ),
        undefined,
        { overwrite: true }
    );

    modelsGraphSourceFile.addVariableStatement( {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: MODELS_GRAPH_VARIABLE_NAME,
                initializer: JSON.stringify( modelsGraph )
            }
        ],
        isExported: true
    } );

    return modelsGraphSourceFile;
};

const generateIndexFile = async (
    project: Project,
    baseGeneratedDirPath: string,
    modules: ( SourceFile | Directory )[]
): Promise<SourceFile> => {
    const indexSourceFile = project.createSourceFile(
        path.resolve( baseGeneratedDirPath, INDEX_FILE_NAME ),
        undefined,
        { overwrite: true }
    );

    modules.forEach( module => {
        const moduleName = module.getBaseName()
            .split( '.' )[ 0 ];

        indexSourceFile.addExportDeclaration( { moduleSpecifier: `./${ moduleName }` } );
    } );

    return indexSourceFile;
};