import { DMMF } from '@prisma/generator-helper';
import { ParsedModel, ParsedModels } from '../types';
import { GeneratorOptions } from '@prisma/generator-helper';

export const parseDMMFModels = (
    options: GeneratorOptions
): ParsedModels => {
    const models = options.dmmf.datamodel.models;

    const parsedModels: ParsedModels = {};
    const modelNameDbNameMap: Map<DMMF.Model['name'], string> = new Map();
    const attributesDbNameMap: Map<string, string> = new Map();

    // First pass to init parsedModels object with all model
    // and its attribute with empty relations
    for ( const model of models ) {
        const modelDbName = model.dbName || model.name;
        modelNameDbNameMap.set( model.name, modelDbName );

        console.log( getModelUnsupportedAttributes( options, model.name ) );

        const parsedModel: ParsedModel = {
            attributes: [],
            relations: []
        };

        for ( const field of model.fields ) {
            const attribute = field.dbName || field.name;
            parsedModel.attributes.push( {
                name: attribute,
                type: field.type
            } );
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

export type UnsupportedAttribute = {
    name: string;
    dbName: string;
    type: string;
};

const getModelUnsupportedAttributes = (
    options: GeneratorOptions,
    modelName: DMMF.Model['name']
): UnsupportedAttribute[] => {
    const datamodel = options.datamodel;

    // Split the schema into lines
    const lines = datamodel.split( '\n' );

    const unsupportedAttributes: UnsupportedAttribute[] = [];

    // Find the model definition
    const modelIndex = lines.findIndex( line => line.includes( `model ${ modelName }` ) );

    // Find the unsupported attribute within the model definition
    for ( let i = modelIndex + 1; i < lines.length; i++ ) {
        const line = lines[ i ];

        // Check if we've reached the end of the model definition
        if ( line.includes( '}' ) ) {
            break;
        }

        // Check if the line defines an unsupported attribute
        if ( line.includes( 'Unsupported' ) ) {
            // Extract the attribute name (assuming it's the first word in the line)
            const attributeDefinitionsParts = line.trim()
                .split( ' ' );

            const attributeName = attributeDefinitionsParts[ 0 ];
            const typeDefinition = attributeDefinitionsParts[ 1 ];

            let attributeMappedName: string | null = null;

            attributeDefinitionsParts.forEach( part => {
                if ( part.includes( '@map' ) ) {
                    attributeMappedName = parseMappedNameDefinition( part );
                }
            } );

            const trimmedType = parseUnsupportedTypeDefinition( typeDefinition );

            unsupportedAttributes.push( {
                name: attributeName,
                dbName: attributeMappedName || attributeName,
                type: trimmedType
            } );
        }
    }

    return unsupportedAttributes;
};

/**
 * Parse Unsupported type definition in Prisma format to extract the correct trimmed DB type.
 * E.g: geography(Point, 4326)
 * @param typeDefinition Unsupported type definition in Prisma format. E.g: Unsupported("geography(Point,4326)")?
 */
const parseUnsupportedTypeDefinition = ( typeDefinition: string ): string => {
    const regex = new RegExp( /Unsupported\("([^"]+)"\)/ );
    const matches = regex.exec( typeDefinition );

    if ( !matches ) {
        throw new Error( 'Invalid Unsupported type definition format.' );
    }

    const [ , matchWithoutSymbol ] = matches;

    return matchWithoutSymbol;
};

/**
 * Parse Mapped name definition in Prisma format to extract the correct DB column name.
 * @param mappedNameDefinition Mapped name definition in Prisma format. E.g: @map("lat_lng_geography")
 */
const parseMappedNameDefinition = ( mappedNameDefinition: string ): string => {
    const regex = new RegExp( /@map\("([^"]+)"\)/ );

    const matches = regex.exec( mappedNameDefinition );

    if ( !matches ) {
        throw new Error( 'Invalid mapped name definition format.' );
    }

    const [ , matchWithoutSymbol ] = matches;

    return matchWithoutSymbol;
};