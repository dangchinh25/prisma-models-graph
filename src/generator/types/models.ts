export type ParsedModelRelation = {
    modelName: string;
    condition: string;
};

export type ParsedModelAttribute = {
    name: string;
    type: string;
};

export type ParsedModel = {
    attributes: ParsedModelAttribute[];
    relations: ParsedModelRelation[];
};

export type ParsedModels = {
    [modelName: string]: ParsedModel;
};