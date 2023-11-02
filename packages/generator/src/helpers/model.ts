import { DMMF } from '@prisma/generator-helper';
import { ParsedModel, ParsedModels } from 'src/types';

export const parseDMMFModels = (
    models: DMMF.Model[]
): ParsedModels => {
    const parsedModels: ParsedModels = {};
    const modelsMap: Map<DMMF.Model['name'], DMMF.Model> = new Map();
    const attributesDbNameMap: Map<string, string> = new Map();

    for ( const model of models ) {
        modelsMap.set( model.name, model );
        const dbName = model.dbName || model.name;

        const parsedModel: ParsedModel = {
            attributes: [],
            relations: []
        };

        for ( const field of model.fields ) {
            const attribute = field.dbName || field.name;
            parsedModel.attributes.push( attribute );
            attributesDbNameMap.set( `${ model.name }.${ field.name }`, attribute );
        }

        parsedModels[ dbName ] = parsedModel;
    }

    for ( const model of models ) {
        const dbName = model.dbName || model.name;

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

            const relationModel = modelsMap.get( relationModelName );

            if ( !relationModel ) {
                continue;
            }

            const relationModelDbName = relationModel.dbName || relationModel.name;

            parsedModels[ dbName ].relations.push( {
                modelName: relationModelDbName,
                condition: `${ dbName }.${ fieldDbName } = ${ relationModelDbName }.${ relationAttributeDbName }`
            } );

            parsedModels[ relationModelDbName ].relations.push( {
                modelName: dbName,
                condition: `${ relationModelDbName }.${ relationAttributeDbName } = ${ dbName }.${ fieldDbName }`
            } );
        }
    }

    return parsedModels;
};