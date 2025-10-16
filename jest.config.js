/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'jest-preset-angular',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    transform: {
        '^.+\\.(ts|js|html)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'html', 'js', 'json'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
