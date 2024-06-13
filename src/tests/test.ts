export abstract class Test {
    static assertEqual(actual: any, expected: any, message: string) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
                `Assertion failed: ${message}. Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
            );
        }
    }

    static runTests() {
        console.warn('No tests implemented');
    }
}
