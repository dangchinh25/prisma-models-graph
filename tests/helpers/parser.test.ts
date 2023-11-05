import { parseDMMFModels } from '../../src/helpers';
import { getSampleDMMF } from '../__fixtures__/getSampleDMMF';
import { ParsedModels } from '../../src/types';
import { DMMF } from '@prisma/generator-helper';

describe( 'parseDMMFModels', () => {
    let parsedModels: ParsedModels;
    let dmmfModels: DMMF.Model[];

    beforeAll( async () => {
        const sampleDMMF = await getSampleDMMF();
        dmmfModels = sampleDMMF.datamodel.models;
        parsedModels = parseDMMFModels( dmmfModels );
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

            const modelAttributes = model.fields.map( field => field.dbName || field.name );

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