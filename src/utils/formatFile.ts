import prettier, { Options } from 'prettier';

/**
 * Format content with a specificy parser by Prettier
 * @param content
 * @param parser Prettier parser. Find out more [here](https://prettier.io/docs/en/options.html#parser). Default is 'json-stringify'
 */
export const formatFile = async (
    content: string,
    parser: Options['parser'] = 'json-stringify'
): Promise<string> => {
    const formatted = prettier.format( content, { parser } );

    return formatted;
};
