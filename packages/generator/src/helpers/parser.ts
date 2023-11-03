import { DMMF } from '@prisma/generator-helper';
import { ParsedModel, ParsedModels } from 'src/types';

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

            const relationAttribute = documentation.replace( /\[\[|\]\]/g, '' );
            const relationModelName = relationAttribute.split( '.' )[ 0 ];
            const relationAttributeDbName = attributesDbNameMap.get( relationAttribute );

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