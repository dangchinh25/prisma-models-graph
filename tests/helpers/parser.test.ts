import { parseDMMFModels } from '../../src/generator/helpers';
import { getSampleDMMF, getSampleSchema } from '../__fixtures__/getSampleDMMF';
import { ParsedModels } from '../../src/generator/types';
import { DMMF, GeneratorOptions } from '@prisma/generator-helper';

describe( 'parseDMMFModels', () => {
    let parsedModels: ParsedModels;
    let dmmfModels: DMMF.Model[];

    beforeAll( async () => {
        const sampleDMMF = await getSampleDMMF();
        const samepleSchema = await getSampleSchema();
        dmmfModels = sampleDMMF.datamodel.models;
        parsedModels = parseDMMFModels( { dmmf: sampleDMMF, datamodel: samepleSchema } as GeneratorOptions );
    } );

    it( 'generates all models with correct db name', () => {
        const modelDbNames = dmmfModels.map( model => model.dbName || model.name );

        expect( Object.keys( parsedModels ) )
            .toHaveLength( 5 );
        expect( Object.keys( parsedModels ) )
            .toStrictEqual(
                expect.arrayContaining( modelDbNames )
            );
    } );

    it( 'generates all attributes of each models', () => {
        dmmfModels.map( model => {
            const modelDbName = model.dbName || model.name;
            const parsedModel = parsedModels[ modelDbName ];

            const modelAttributes = model.fields.map( field => {
                return {
                    name: field.dbName || field.name,
                    type: field.type
                };
            } );

            expect( parsedModel.attributes )
                .toStrictEqual( expect.arrayContaining( modelAttributes ) );
        } );
    } );

    it( 'generates bi-direction relation on both side of the relations', () => {
        const { relations: userModelRelations } = parsedModels[ 'users' ];
        const { relations: postModelRelations } = parsedModels[ 'posts' ];

        expect( userModelRelations ).not.toHaveLength( 0 );
        expect( postModelRelations ).not.toHaveLength( 0 );

        const userPostRelation = userModelRelations.find( relation => relation.modelName === 'posts' );

        expect( userPostRelation )
            .toBeDefined( );

        expect( userPostRelation?.condition )
            .toBe( 'users.id = posts.user_id' );

        const postUserRelation = postModelRelations.find( relation => relation.modelName === 'users' );

        expect( postUserRelation )
            .toBeDefined();

        // Todo: For some reason get sampleDMMF does not work well with @map tags
        expect( postUserRelation?.condition )
            .toBe( 'posts.user_id = users.id' );
    } );
} );