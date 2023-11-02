export type ParseModelRelation = {
    modelName: string;
    condition: string;
};

export type ParsedModel = {
    attributes: string[];
    relations: ParseModelRelation[];
};

export type ParsedModels = {
    [modelName: string]: ParsedModel;
};