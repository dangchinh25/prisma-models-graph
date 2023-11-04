module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    modulePathIgnorePatterns: [
        '__helpers__/',
        '__fixtures__/'
    ]
};
