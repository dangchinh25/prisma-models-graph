import { DMMF } from '@prisma/generator-helper';
import { getInitialJSON } from './jsonModelsGraph';

export const parseDMMFModels = (
    models: DMMF.Model[]
): Record<string, unknown> => {
    const initialJSON = getInitialJSON();

    for ( const model of models ) {
        const dbName = model.dbName || model.name;
        initialJSON[ dbName ] = {};
    }

    return initialJSON;
};