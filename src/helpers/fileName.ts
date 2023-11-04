/**
 * Format file name into format 'fileName.json'
 */
export const formatFileName = (
    fileName: string
): string => {
    const fileNameParts = fileName.split( '.' );

    const formattedFileName = `${ fileNameParts[ 0 ] }.json`;

    return formattedFileName;
};