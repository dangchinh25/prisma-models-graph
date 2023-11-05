export type ParsedModelRelation = {
    modelName: string;
    condition: string;
};

export type ParsedModel = {
    attributes: string[];
    relations: ParsedModelRelation[];
};

export type ParsedModels = {
    [modelName: string]: ParsedModel;
};