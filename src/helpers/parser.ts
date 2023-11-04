import { DMMF } from '@prisma/generator-helper';
import { ParsedModel, ParsedModels } from '../types';

export const parseDMMFModels = (
    models: DMMF.Model[]
): ParsedModels => {
    const parsedModels: ParsedModels = {};
    const modelNameDbNameMap: Map<DMMF.Model['name'], string> = new Map();
    const attributesDbNameMap: Map<string, string> = new Map();

    // First pass to init parsedModels object with all model
    // and its attribute with empty relations
    for ( const model of models ) {
        const modelDbName = model.dbName || model.name;
        modelNameDbNameMap.set( model.name, modelDbName );

        const parsedModel: ParsedModel = {
            attributes: [],
            relations: []
        };

        for ( const field of model.fields ) {
            const attribute = field.dbName || field.name;
            parsedModel.attributes.push( attribute );
            attributesDbNameMap.set( `${ model.name }.${ field.name }`, attribute );
        }

        parsedModels[ modelDbName ] = parsedModel;
    }

    // Second pass to populate bi-directional relations
    for ( const model of models ) {
        const modelDbName = modelNameDbNameMap.get( model.name );

        if ( !modelDbName ) {
            continue;
        }

        for ( const field of model.fields ) {
            const { documentation } = field;
            const fieldDbName = field.dbName || field.name;

            if ( !documentation ) {
                continue;
            }

            const relationAnnotation = parseDMMFFieldDocumentation( documentation );
            const relationModelName = relationAnnotation.split( '.' )[ 0 ];
            const relationAttributeDbName = attributesDbNameMap.get( relationAnnotation );

            if ( !relationAttributeDbName ) {
                continue;
            }

            const relationModelDbName = modelNameDbNameMap.get( relationModelName );

            if ( !relationModelDbName ) {
                continue;
            }

            parsedModels[ modelDbName ].relations.push( {
                modelName: relationModelDbName,
                condition: `${ modelDbName }.${ fieldDbName } = ${ relationModelDbName }.${ relationAttributeDbName }`
            } );

            parsedModels[ relationModelDbName ].relations.push( {
                modelName: modelDbName,
                condition: `${ relationModelDbName }.${ relationAttributeDbName } = ${ modelDbName }.${ fieldDbName }`
            } );
        }
    }

    return parsedModels;
};

/**
 * Use RegExp to parse, validate and extract
 * relation annotation
 * @returns relationAnnotation
 */
const parseDMMFFieldDocumentation = (
    fieldDocumentation: string
): string => {
    const regex = new RegExp( /\[\[(.*?)\]\]/g );

    const matches = regex.exec( fieldDocumentation );

    if ( !matches ) {
        throw new Error( 'Invalid relation annotation format.' );
    }

    const [ , matchWithoutSymbol ] = matches;

    return matchWithoutSymbol;
};