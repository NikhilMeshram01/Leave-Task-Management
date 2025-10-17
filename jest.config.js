/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'js', 'html'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular|rxjs)'],
};