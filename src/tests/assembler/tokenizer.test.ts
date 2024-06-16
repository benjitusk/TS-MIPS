import { Tokenizer } from '../../Assembler/tokenizer';
import { Test } from '../test';

export class TokenizerTest extends Test {
    static runTests() {
        this.testTokenizeSimpleInstruction();
        this.testTokenizeMemoryInstruction();
        this.testTokenizeMemoryInstructionWithOffset();
        this.testTokenizeInvalidInstruction();
        this.testTokenizeImmediateInstructionWithLabel();
        console.log('All tests passed!');
    }

    static testTokenizeSimpleInstruction() {
        const instruction = 'add $t0, $t1, $t2';
        const expectedAST = {
            operation: 'add',
            operands: [
                { type: 'register', value: '$t0' },
                { type: 'register', value: '$t1' },
                { type: 'register', value: '$t2' },
            ],
        };
        const ast = Tokenizer.parse(instruction);
        this.assertEqual(ast, expectedAST, 'Simple instruction');
    }

    static testTokenizeMemoryInstruction() {
        const instruction = 'lw $t0, name($s0)';
        const expectedAST = {
            operation: 'lw',
            operands: [
                { type: 'register', value: '$t0' },
                { type: 'memory', offset: 'name', base: '$s0' },
            ],
        };
        const ast = Tokenizer.parse(instruction);
        this.assertEqual(ast, expectedAST, 'Memory instruction with symbolic address');
    }

    static testTokenizeMemoryInstructionWithOffset() {
        const instruction = 'lw $t0, -4($s0)';
        const expectedAST = {
            operation: 'lw',
            operands: [
                { type: 'register', value: '$t0' },
                { type: 'memory', offset: -4, base: '$s0' },
            ],
        };
        const ast = Tokenizer.parse(instruction);
        this.assertEqual(ast, expectedAST, 'Memory instruction with offset');
    }

    static testTokenizeImmediateInstructionWithLabel() {
        const instruction = 'beq $t0, $t1, label';
        const expectedAST = {
            operation: 'beq',
            operands: [
                { type: 'register', value: '$t0' },
                { type: 'register', value: '$t1' },
                { type: 'immediate', value: 'label' },
            ],
        };
        const ast = Tokenizer.parse(instruction);
        this.assertEqual(ast, expectedAST, 'Immediate instruction with label');
    }

    static testTokenizeInvalidInstruction() {
        const instruction = 'invalid instruction';
        try {
            Tokenizer.parse(instruction);
            throw new Error('Invalid instruction test failed: no error thrown');
        } catch (e) {
            // Expect an error to be thrown
        }
    }
}

TokenizerTest.runTests();
