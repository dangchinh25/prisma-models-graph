import prettier, { Options } from 'prettier';

/**
 * Format content with a specificy parser by Prettier
 * @param content
 * @param parser Prettier parser. Find out more [here](https://prettier.io/docs/en/options.html#parser). Default is 'json-stringify'
 */
export const formatFile = (
    content: string,
    parser: Options['parser'] = 'json-stringify'
): Promise<string> => {
    return new Promise( ( res, rej ) =>
        prettier.resolveConfig( process.cwd() )
            .then( ( options ) => {
                if ( !options ) {
                    res( content ); // no prettier config was found, no need to format
                }

                try {
                    const formatted = prettier.format( content, {
                        ...options,
                        parser
                    } );

                    res( formatted );
                } catch ( error ) {
                    rej( error );
                }
            } ) );
};
