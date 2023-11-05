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
    MODELS_GRAPH_FILE_NAME,
    MODELS_GRAPH_VARIABLE_NAME,
    PARSED_MODELS_TYPE_NAME,
    PARSED_MODEL_RELATION_TYPE_NAME,
    PARSED_MODEL_TYPE_NAME,
    TYPE_DIRECTORY_NAME
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

    const generatedTypesDirectory = await generateTypeDirectory(
        project,
        baseDirPath
    );

    const generatedModelsGraphFile = await generateModelsGraphFile(
        project,
        baseDirPath,
        generatedTypesDirectory.getPath(),
        modelsGraph
    );

    await generateIndexFile( project, baseDirPath, [
        generatedTypesDirectory,
        generatedModelsGraphFile
    ] );

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

    const modelsTypeSourceFile = generatedTypeDirectory.createSourceFile(
        path.resolve( generatedTypeDirectory.getPath(), 'models.ts' ),
        `export type ${ PARSED_MODEL_RELATION_TYPE_NAME } = {
            modelName: string;
            condition: string;
        };
        
        export type ${ PARSED_MODEL_TYPE_NAME } = {
            attributes: string[];
            relations: ${ PARSED_MODEL_RELATION_TYPE_NAME }[];
        };
        
        export type ${ PARSED_MODELS_TYPE_NAME } = {
            [modelName: string]: ${ PARSED_MODEL_TYPE_NAME };
        };`,
        { overwrite: true }
    );

    await generateIndexFile(
        project,
        generatedTypeDirectory.getPath(),
        [ modelsTypeSourceFile ]
    );

    await generatedTypeDirectory.save();

    return generatedTypeDirectory;
};

const generateModelsGraphFile = async (
    project: Project,
    baseGeneratedDirPath: string,
    generatedTypesDirectoryPath: string,
    modelsGraph: ParsedModels
): Promise<SourceFile> => {
    const modelsGraphSourceFile = project.createSourceFile(
        path.resolve( baseGeneratedDirPath, MODELS_GRAPH_FILE_NAME ),
        undefined,
        { overwrite: true }
    );

    const relativePathToTypesDirectory = `./${ modelsGraphSourceFile.getRelativePathTo( generatedTypesDirectoryPath ) }`;

    modelsGraphSourceFile.addImportDeclarations( [
        {
            moduleSpecifier: relativePathToTypesDirectory,
            namedImports: [ PARSED_MODELS_TYPE_NAME ]
        }
    ] );

    modelsGraphSourceFile.addVariableStatement( {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: MODELS_GRAPH_VARIABLE_NAME,
                type: PARSED_MODELS_TYPE_NAME,
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