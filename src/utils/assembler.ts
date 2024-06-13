/// Author: Benji Tusk
/// Description: Assembler class for assembling source code into machine code

import _, { trim } from 'lodash';
import { isMIPSInstruction, isValidRegister, MIPS_CORE_INSTRUCTIONS, MIPS_OP, registerLookup } from '../language/MIPS';
import { AssemblerDirective, isMIPSAssemblerDirective, MIPS_ASSEMBLER_DIRECTIVES } from '../language/ASMDirectives';
import * as MIPSErrors from './Errors';
import { Memory } from '../components/memory';

type MIPSInstruction = string;

/**
 * Assembler
 *
 * Assembler is responsible for assembling the source code into machine code.
 *
 * The assembler is responsible for:
 * - Parsing the source code
 * - Validating the source code
 * - Assembling the source code into machine code
 * - Returning the machine code
 *
 */
export class Assembler {
    constructor(memory_ref: Memory) {
        this.memory = memory_ref;
    }

    /** A reference to the MIPS chip's memory component */
    private memory: Memory;

    /** A symbol table for tracking the labels and addresses */
    private symbolTable = {
        '.text': 0x00400000,
        '.data': 0x10010000,
    } as { [label: string]: number };

    /**
     * Compiles the given source code into machine code.
     *
     * @param source The source code to be assembled
     * @returns The machine code generated from the source code
     */
    private compile(source: string): Uint32Array {
        // Parse the source code (Lexical analysis and parsing)
        const instructions = this.parse(source);

        // Validate the instructions (Syntax analysis, pseudo instruction expansion)
        // List of pseudo instructions: https://en.wikibooks.org/wiki/MIPS_Assembly/Pseudoinstructions
        this.validate(instructions);

        // First Pass: Symbol Table Generation
        this.buildSymbolTable(instructions);

        // Second Pass: Translate instructions to machine code
        return this.assembleInstructions(instructions);
    }

    /**
     * Loads the given machine code into memory.
     *
     * @param machineCode The machine code to be loaded into memory
     * @param address The address in memory to load the machine code
     * @returns The address in memory where the machine code was loaded
     *
     * @throws An error if the address is out of bounds
     */
    private load(machineCode: Uint32Array, address: number): number {
        // Convert the Uint32Array to a Uint8Array
        const instructions = new Uint8Array(machineCode.buffer);

        // Load the machine code into memory
        this.memory.write(address, instructions);

        // Return the address where the machine code was loaded
        return address;
    }

    /**
     * The main entry point for the assembler.
     *
     * @param source The source code to be assembled
     * @param address The address in memory to load the machine code
     * @returns The address in memory where the machine code was loaded
     */
    public assemble(source: string, address: number): number {
        // Compile the source code into machine code
        const machineCode = this.compile(source);

        // Load the machine code into memory
        return this.load(machineCode, address);
    }

    /**
     * Parses the given source code into individual instructions.
     *
     * @param source The source code to be parsed
     * @returns The instructions parsed from the source code
     */
    private parse(source: string): MIPSInstruction[] {
        // Clean up whitespace
        source = source.trim();

        // Split into individual instructions
        let instructions = source.split('\n');

        // Clean up each instruction
        instructions = _(instructions)
            .map((line) => line.split(';')[0]) // Strip out comments
            .filter((line) => !_.isEmpty(line)) // Remove empty lines
            .map(
                (line) =>
                    line
                        .split(' ') // For each word
                        .map(trim) // Make sure there is no extra spacing
                        .filter((line) => !_.isEmpty(line)) // Strip any blank entries
                        .join(' ') // Stitch the sanitized line back together
            )
            .value();
        return instructions as MIPSInstruction[];
    }

    private buildSymbolTable(instructions: MIPSInstruction[]): MIPSInstruction[] {
        // Start at the beginning of where the program will be stored
        let segment: '.text' | '.data' = '.text';
        const locationCounter = {
            '.text': this.symbolTable['.text'],
            '.data': this.symbolTable['.data'],
        };
        const linesToStrip: number[] = [];
        for (const [index, line] of instructions.entries()) {
            const [command, ...args] = line.split(' ');
            // Check if the line is a directive to change data segments
            if (isMIPSAssemblerDirective(command)) {
                // Mark this line for removal after building the symbol table
                linesToStrip.push(index);
                if (line === '.text' || line === '.data') {
                    segment = line;
                }

                // Build the directive
                const directive = new AssemblerDirective(this, command, args, locationCounter[segment]);

                // Execute the directive
                directive.execute();

                // Calculate the forward offset
                const forwardOffset = directive.calculateForwardOffset();

                // Update the location counter
                locationCounter[segment] += forwardOffset;
            } else {
                // It's a standard 4 byte MIPS instruction
                locationCounter[segment] += 0x0004;
            }
        }
        for (const index of linesToStrip) {
            instructions.splice(index, 1);
        }
        return instructions;
    }

    /**
     * Validates the given instructions.
     *
     * @param instructions The instructions to be validated
     *
     * @throws An error if the instructions are invalid
     */
    private validate(instructions: MIPSInstruction[]) {
        for (const [index, instruction] of instructions.entries()) {
            const [word, ...args] = instruction.split(' ');
            if (isMIPSAssemblerDirective(word)) {
                try {
                    MIPS_ASSEMBLER_DIRECTIVES[word].validate(args);
                } catch (e) {
                    throw new MIPSErrors.MIPSAssemblerDirectiveSyntaxError(word, index);
                }
            } else if (isMIPSInstruction(word))
                try {
                    MIPS_CORE_INSTRUCTIONS[word].validate(args);
                } catch (e) {
                    throw new MIPSErrors.MIPSAssemblerInstructionSyntaxError(word, index);
                }
            else throw new MIPSErrors.MIPSAssemblerSyntaxError(instruction, index);
        }
    }

    /**
     * Assembles the given instructions into machine code.
     *
     * @param instructions The instructions to be assembled
     * @returns The machine code generated from the instructions
     */
    private assembleInstructions(instructions: MIPSInstruction[]): Uint32Array {
        const machineCode = new Uint32Array(instructions.length);
        let bufferPointer = 0;
        // At this stage, each line should be a single valid MIPS instruction
        for (const instruction of instructions) {
            const op = instruction.split(' ')[0] as MIPS_OP;
            const [, ...args] = instruction.split(' ');
            let rawInstruction = 0x00000000000000000000000000000000;
            const instructionDetails = MIPS_CORE_INSTRUCTIONS[op];
            // Get the 6 bit opcode
            const opCode = instructionDetails.opCode;
            rawInstruction |= opCode << (32 - 6);
            switch (op) {
                // All R type commands of format `op $rs $rt $rd`
                case 'add':
                case 'addu':
                case 'and':
                case 'nor':
                case 'or':
                case 'slt':
                case 'sltu':
                case 'sll':
                case 'sub':
                case 'subu':
                    // 0xOOOOOOSSSSSTTTTTDDDDDHHHHHFFFFFF
                    // Get the registers
                    let [rs, rt, rd] = args
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    // TODO: Add shftAmt to instruction details
                    const shftAmt = instructionDetails.shftAmt ?? 0;
                    const funct = instructionDetails.funct ?? 0;

                    rawInstruction |= rs << (26 - 5);
                    rawInstruction |= rt << (21 - 5);
                    rawInstruction |= rd << (15 - 5);
                    rawInstruction |= shftAmt << (10 - 5);
                    rawInstruction |= funct << (5 - 5);
                    break;
            }
            const instructionBuffer = new Uint32Array([rawInstruction]);
            machineCode.set(instructionBuffer, bufferPointer);
        }

        // TODO: First step is replace all labels with their offset value
        // TODO: Then create a binary representation of the instruction, registers, and immediate values
        // TODO: Then zero-extend it to 32 bits (one word) and append it to the result
        return machineCode;
    }
}
