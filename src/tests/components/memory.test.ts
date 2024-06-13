import { Memory } from '../../components/memory';

class MemoryTest {
    static runTests() {
        this.testMemoryInitialization();
        this.testMemoryReadWriteByte();
        this.testMemoryReadWriteWord();
        this.testMemoryOutOfBounds();
        this.testMemoryListeners();
        this.testMemoryClear();
        console.log('All tests passed!');
    }

    static assertEqual(actual: any, expected: any, message: string) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
                `Assertion failed: ${message}. Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
            );
        }
    }

    static assertThrows(fn: Function, message: string) {
        try {
            fn();
            throw new Error(`Assertion failed: ${message}. Expected function to throw an error.`);
        } catch (e) {
            // Expected error
        }
    }

    static testMemoryInitialization() {
        const memorySize = 1024;
        const memory = new Memory(memorySize);
        this.assertEqual(memory['memory'].length, memorySize, 'Memory initialization with correct size');
    }

    static testMemoryReadWriteByte() {
        const memory = new Memory(1024);
        const address = 0x100;
        const data = new Uint8Array([42]);

        memory.write(address, data);
        const readData = memory.readByte(address);

        this.assertEqual(readData, data, 'Memory read/write single byte');
    }

    static testMemoryReadWriteWord() {
        const memory = new Memory(1024);
        const address = 0x100;
        const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

        memory.write(address, data);
        const readData = memory.readWord(address);

        this.assertEqual(readData, Uint32Array.from([0x01020304]), 'Memory read/write word');
    }

    static testMemoryOutOfBounds() {
        const memory = new Memory(1024);
        this.assertThrows(() => memory.readByte(1024), 'Memory read out of bounds');
        this.assertThrows(() => memory.write(1024, new Uint8Array([42])), 'Memory write out of bounds');
    }

    static testMemoryListeners() {
        const memory = new Memory(1024);
        const address = 100;
        const data = new Uint8Array([42]);
        let listenerCalled = false;

        memory.addListener(address, (writtenData: Uint8Array) => {
            listenerCalled = true;
            this.assertEqual(writtenData, data, 'Memory listener data check');
        });

        memory.write(address, data);
        this.assertEqual(listenerCalled, true, 'Memory listener called on write');
    }

    static testMemoryClear() {
        const memory = new Memory(1024);
        const address = 100;
        const data = new Uint8Array([42]);

        memory.write(address, data);
        memory.clear();
        const readData = memory.readByte(address);

        this.assertEqual(readData, new Uint8Array([0]), 'Memory clear functionality');
    }
}

// Run the tests
MemoryTest.runTests();
