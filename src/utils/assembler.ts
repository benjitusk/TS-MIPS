/// Author: Benji Tusk
/// Description: Assembler class for assembling source code into machine code

import _, { trim } from 'lodash';
import { isMIPSInstruction, MIPS_CORE_INSTRUCTIONS, MIPS_OP } from '../language/MIPS';
import { isMIPSAssemblerDirective, MIPS_ASSEMBLER_DIRECTIVES } from '../language/ASMDirectives';
import * as MIPSErrors from './Errors';

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

    private memory: Memory;

    /**
     * Compiles the given source code into machine code.
     *
     * @param source The source code to be assembled
     * @returns The machine code generated from the source code
     */
    private compile(source: string): Uint32Array {
        // Parse the source code
        const instructions = this.parse(source);

        // Validate the source code and sort it by type
        const { MIPS, asmDirectives } = this.validate(instructions);

        // Execute assembler directives
        this.executeDirectives(asmDirectives);

        // Assemble the source code
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
    private parse(source: string): string[] {
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
        return instructions;
    }

    /**
     * Processes the assembler directives in the given instructions.
     * Assembler directives are special instructions that are not executed
     * by the processor, but are used to control the assembler.
     *
     * @param instructions The instructions to be processed
     * @returns The instructions with the assembler directives removed
     *
     * @throws An error if an invalid directive is found
     * @throws An error if an invalid label is found
     */
    private executeDirectives(instructions: string[]): void {
        for (let directive of instructions) {
            // Remove the leading .
            directive = directive.substring(1);

            // Get the actual instruction
            const instruction = directive.split(' ');

            // TODO: Implement Assembler Directives
            console.warn(`ASM_DIRECTIVE ${instruction} NOT IMPLEMENTED`);
        }
    }

    /**
     * Validates the given instructions.
     *
     * @param instructions The instructions to be validated
     *
     * @throws An error if the instructions are invalid
     */
    private validate(instructions: string[]) {
        const categoriezedInstructions = {
            MIPS: [],
            asmDirectives: [],
        } as { MIPS: MIPS_OP[]; asmDirectives: string[] };

        for (const [index, instruction] of instructions.entries()) {
            const [word, ...args] = instruction.split(' ');
            if (isMIPSAssemblerDirective(word)) {
                try {
                    MIPS_ASSEMBLER_DIRECTIVES[word].validate(args);
                } catch (e) {
                    throw new MIPSErrors.MIPSAssemblerDirectiveSyntaxError(word, index);
                }
                categoriezedInstructions.asmDirectives.push(instruction);
            } else if (isMIPSInstruction(word))
                try {
                    MIPS_CORE_INSTRUCTIONS[word].validate(args);
                } catch (e) {
                    throw new MIPSErrors.MIPSAssemblerInstructionSyntaxError(word, index);
                }
            else throw new MIPSErrors.MIPSAssemblerSyntaxError(instruction, index);
        }
        // Make sure each MIPS instruction exists
        for (const instruction of categoriezedInstructions.MIPS) {
            if (isMIPSInstruction(instruction)) {
                throw `Invalid instruction: ${instruction}`;
            }
        }
        return categoriezedInstructions;
    }

    /**
     * Assembles the given instructions into machine code.
     *
     * @param instructions The instructions to be assembled
     * @returns The machine code generated from the instructions
     */
    private assembleInstructions(instructions: string[]): Uint32Array {
        throw 'NOT IMPLEMENTED';
    }
}
