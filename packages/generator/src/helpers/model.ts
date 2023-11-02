import { DMMF } from '@prisma/generator-helper';
import { ParsedModel, ParsedModels } from 'src/types';

export const parseDMMFModels = (
    models: DMMF.Model[]
): ParsedModels => {
    const parsedModels: ParsedModels = {};

    for ( const model of models ) {
        const dbName = model.dbName || model.name;
        parsedModels[ dbName ] = parseDMMFModel( model );
    }

    return parsedModels;
};

export const parseDMMFModel = (
    model: DMMF.Model
): ParsedModel => {
    console.log( model );

    const parsedModel: ParsedModel = {
        attributes: [],
        relations: []
    };

    const { fields } = model;

    for ( const field of fields ) {
        const attribute = field.dbName || field.name;
        parsedModel.attributes.push( attribute );
    }

    return parsedModel;
};