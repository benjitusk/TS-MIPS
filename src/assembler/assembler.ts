/// Author: Benji Tusk
/// Description: Assembler class for assembling source code into machine code

import _, { trim } from 'lodash';
import {
    isMIPSInstruction,
    isValidLabel,
    isValidRegister,
    MIPS_INSTRUCTIONS,
    registerLookup,
    unaliasRegister,
    MIPS_OP,
    MIPS_CORE_OP,
    MIPS_NON_CORE_OP,
    MIPS_PSEUDO_OP,
} from '../language/MIPS';
import { AssemblerDirective, isMIPSAssemblerDirective, MIPS_ASSEMBLER_DIRECTIVES } from '../language/ASMDirectives';
import { isMIPSPseudoInstruction } from '../language/MIPS';
import * as MIPSErrors from '../utils/Errors';
import { Memory } from '../components/memory';
import { Tokenizer } from './tokenizer';

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

    /** A list of instructions to be assembled */
    private instructions: MIPSInstruction[] = [];

    /** A symbol table for tracking the labels and addresses */
    private symbolTable = {
        '.text': 0x00000000, // Start of the text segment is at address 0
        '.data': 0x00000800, // Start of the data segment is at address 65536 (64KiB)
    } as { [label: string]: number };

    /**
     * Compiles the given source code into machine code.
     *
     * @param source The source code to be assembled
     * @returns The machine code generated from the source code
     */
    private compile(source: string): Uint32Array {
        // Parse the source code (Lexical analysis and parsing)
        this.instructions = this.parse(source);

        // First Pass: Symbol Table Generation, Pseudo Instruction Expansion, and Syntax Analysis
        // List of pseudo instructions: https://en.wikibooks.org/wiki/MIPS_Assembly/Pseudoinstructions
        this.validate();
        this.buildSymbolTable();

        // Second Pass: Symbol Resolution
        // Expand all pseudo instructions,
        // replace all labels with their offsets,
        // and execute directives to allocate memory
        const resolvedInstructions = this.resolveSymbols();

        return this.assembleInstructions(resolvedInstructions);
    }

    // MARK: - Symbol Resolution
    /**
     * Resolves all symbols in the given instructions.
     * This includes replacing all labels with their offsets,
     * and de-aliasing all registers.
     *
     * This is step 2 of the two-pass assembler.
     *
     * @returns The instructions with all symbols resolved
     */
    private resolveSymbols(): MIPSInstruction[] {
        let instructions = this.instructions;
        let segment: '.text' | '.data' = '.text';
        const locationCounter = {
            '.text': this.symbolTable['.text'],
            '.data': this.symbolTable['.data'],
        };

        // Stage 1: Calculate the final symbol table
        // This is done by calculating the length of each instruction
        // which can be 4 bytes (standard MIPS instruction) or 8 bytes (pseudoinstruction),
        // and updating the symbol table with the final offset of each label.

        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            if (isValidLabel(instruction)) continue;
            if (instruction === '.text' || instruction === '.data') {
                segment = instruction;
                continue;
            }

            const [op, ...args] = instruction.split(' ');
            if (isMIPSAssemblerDirective(op)) {
                // Build the directive
                const directive = new AssemblerDirective(this, op, args, locationCounter[segment]);

                // Calculate the forward offset
                const forwardOffset = directive.calculateForwardOffset();

                // Update the location counter
                locationCounter[segment] += forwardOffset;

                // Go to the next instruction
                continue;
            }

            let instructionLength = 4;
            if (isMIPSPseudoInstruction(op)) {
                const expanded = this.expand(instruction, i + 1);
                instructionLength = expanded.length * 4;
                // Update the symbol table
                for (const label in this.symbolTable) {
                    // Skip the segment labels
                    if (label === '.text' || label === '.data') continue;
                    // If the label is after the current instruction, and is in the same segment
                    // we need to increment the offset by the length of the instruction
                    // First check if this label is in the same segment
                    const labelSegment = this.symbolTable[label] < this.symbolTable['.data'] ? '.text' : '.data';
                    if (labelSegment === segment) {
                        if (labelSegment === '.data') debugger;
                        // Check if the label is after the current instruction
                        if (this.symbolTable[label] >= locationCounter[segment] + instructionLength) {
                            this.symbolTable[label] += instructionLength - 4; // -4 because we originally "double counted" the length of a single instruction during our first pass
                        }
                    }
                }
            }
            locationCounter[segment] += instructionLength;
        }

        // Stage 2: Replace all labels with their offsets.
        // This had to wait until the final symbol table
        // was calculated for offsets to be accurate.

        // We also execute assembler directives at this stage.
        let resolvedInstructions: MIPSInstruction[] = [];

        // Reset the location counter
        locationCounter['.text'] = this.symbolTable['.text'];
        locationCounter['.data'] = this.symbolTable['.data'];
        const linesToStrip: number[] = [];
        for (const [index, instruction] of instructions.entries()) {
            const [command, ...args] = instruction.split(' ');
            if (isMIPSAssemblerDirective(command)) {
                // Mark this line for removal after building the symbol table
                linesToStrip.push(index);
                if (instruction === '.text' || instruction === '.data') {
                    segment = instruction;
                }
                // Execute the directive
                const directive = new AssemblerDirective(this, command, args, locationCounter[segment]);

                // Update the forward offset
                locationCounter[segment] += directive.calculateForwardOffset();
                directive.execute();
            } else if (isValidLabel(command)) {
                // It's a label, no need to do anything here
                linesToStrip.push(index);
            } else {
                // It's a standard 32 bit MIPS instruction
                // Replace all labels with their offsets

                // E.g., `beq $1, $2, label` -> `beq $1, $2, 0x0000000C`
                const tokenizedArgs = Tokenizer.parse(instruction).operands;
                const resolvedArgTokens = tokenizedArgs.map((arg) => {
                    if (arg.type === 'memory' && typeof arg.offset === 'string') {
                        // It's a label, replace it with the offset
                        if (!this.symbolTable[arg.offset]) {
                            throw new MIPSErrors.MIPSAssemblerError(`Unknown label: ${arg.offset}`, index);
                        }
                        arg.offset = this.symbolTable[arg.offset];
                    } else if (arg.type === 'register') {
                        // Replace all registers with their aliases
                        if (!isValidRegister(arg.value)) {
                            throw new MIPSErrors.MIPSAssemblerError(`Unknown register: ${arg.value}`, index);
                        }
                        arg.value = unaliasRegister(arg.value);
                    } else if (arg.type === 'immediate') {
                        // dereference the label if necessary
                        if (typeof arg.value === 'string') {
                            if (!this.symbolTable[arg.value]) {
                                throw new MIPSErrors.MIPSAssemblerError(`Unknown label: ${arg.value}`, index);
                            }
                            arg.value = this.symbolTable[arg.value];
                        }
                    }
                    return arg;
                });

                // Rebuild the instruction
                const resolvedInstruction = `${command} ${resolvedArgTokens
                    .map((arg) => {
                        switch (arg.type) {
                            case 'register':
                            case 'immediate':
                                return arg.value;
                            case 'memory':
                                return `${arg.offset}(${arg.base})`;
                        }
                    })
                    .join(' ')}`.trim();
                // Expand any offset references [e.g., `lw $1, 0($2)` -> `lw $2, $1, 0`]
                // This is necessary because the tokenizer doesn't handle this case
                let memoryExpandedInstruction = resolvedInstruction;

                // Check if the instruction has a memory reference
                if (resolvedArgTokens.map((arg) => arg.type).includes('memory')) {
                    // Extract the memory reference (it's the second argument in the list of tokens)
                    const memoryReference = resolvedArgTokens.find((arg) => arg.type === 'memory')!;
                    // get the source register (it's the first argument in the list of tokens)
                    const source = resolvedArgTokens.find((arg) => arg.type === 'register')!.value;

                    // Replace the memory reference with the expanded instruction
                    memoryExpandedInstruction = `${command} ${source} ${memoryReference.base} ${memoryReference.offset}`;
                }

                // Replace the instruction
                resolvedInstructions[index] = memoryExpandedInstruction;

                // Increment the location counter
                locationCounter[segment] += 4;
            }
        }

        // Clean up the instructions
        // Remove all lines that were marked for removal
        // This includes all labels and assembler directives
        // that were executed in the previous step.
        // We also remove any empty lines.
        resolvedInstructions = resolvedInstructions.filter((_, index) => !linesToStrip.includes(index));

        // Stage 3: Expand Pseudo Instructions
        // Now that the labels were replaced with constants,
        // we can actually split up instructions.
        const expandedInstructions: MIPSInstruction[] = [];
        for (const instruction of resolvedInstructions) {
            const expanded = this.expand(instruction, 0).map((instruction) => instruction.replace(/,/g, ''));
            expandedInstructions.push(...expanded);
        }

        // Remove all labels from the instructions
        return expandedInstructions;
    }

    // MARK: - Pseudo Expansion
    /**
     * Expands the given pseudo instruction into multiple instructions.
     *
     * @param instruction The pseudo instruction to be expanded
     * @returns The expanded instructions
     */
    private expand(instruction: MIPSInstruction, line: number): MIPSInstruction[] {
        // Check if the instruction is a pseudo instruction
        const op = instruction.split(' ')[0] as MIPS_CORE_OP | MIPS_NON_CORE_OP | MIPS_PSEUDO_OP;
        const [, ...args] = instruction.split(' ');
        if (!isMIPSPseudoInstruction(op)) return [instruction];

        // Expand the pseudo instruction
        switch (op) {
            case 'abs':
                return [`sub ${args[0]}, $0, ${args[1]}`, `bge ${args[1]}, $0, 1`, `sub ${args[0]}, $0, ${args[1]}`];
            case 'blt':
                return [`slt $1, ${args[0]}, ${args[1]}`, `bne $1, $0, ${args[2]}`];
            case 'bgt':
                return [`slt $1, ${args[1]}, ${args[0]}`, `bne $1, $0, ${args[2]}`];
            case 'ble':
                return [`slt $1, ${args[1]}, ${args[0]}`, `beq $1, $0, ${args[2]}`];
            case 'neg':
                return [`sub ${args[0]}, $0, ${args[1]}`];
            case 'negu':
                return [`subu ${args[0]}, $0, ${args[1]}`];
            case 'not':
                return [`nor ${args[0]}, ${args[1]}, $0`];
            case 'bge':
                return [`slt $1, ${args[1]}, ${args[0]}`, `beq $1, $0, ${args[2]}`];
            case 'li':
                const li_upperImm = (parseInt(args[1]) >>> 16) & 0xffff;
                const li_lowerImm = parseInt(args[1]) & 0xffff;
                return [`lui ${args[0]}, ${li_upperImm}`, `ori ${args[0]}, ${args[0]}, ${li_lowerImm}`];
            case 'la':
                const la_upperImm = (parseInt(args[1]) >>> 16) & 0xffff;
                const la_lowerImm = parseInt(args[1]) & 0xffff;
                return [`lui ${args[0]}, ${la_upperImm}`, `ori ${args[0]}, ${args[0]}, ${la_lowerImm}`];
            case 'move':
                return [`add ${args[0]}, $0, ${args[1]}`];
            case 'sge':
                return [`slt $1, ${args[1]}, ${args[0]}`, `xori ${args[0]}, $1, 1`];
            case 'sgt':
                return [`slt ${args[0]}, ${args[1]}, ${args[0]}`];
            case 'beqz':
                return [`beq ${args[0]}, $0, ${args[1]}`];
        }
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

    // MARK: - Parsing
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

        // Replace all `;` with `#`
        instructions = instructions.map((line) => line.replace(/;/g, '#'));

        // Remove all comments
        instructions = instructions.map((line) => line.split('#')[0]);

        // Replace all `:` that are not the last character on the line with `:\n`
        instructions = instructions.map(splitLabels).flat();

        // Clean up each instruction
        instructions = _(instructions)
            .map((line) => line.split(/[#;]/)[0]) // Strip out comments
            .filter((line) => !_.isEmpty(line.trim())) // Remove empty lines
            .map((line) => {
                const parts = line.trim().split(/\s+/); // Split by whitespace
                const op = parts.shift(); // Extract the operation
                const params = parts
                    .join(' ')
                    .split(',')
                    .map(trim)
                    .filter((part) => !_.isEmpty(part)); // Process parameters
                return [op, ...params].join(' '); // Join operation and parameters with space
            })
            .map(convertCharLiterals) // Convert character literals to ASCII values
            .value();

        return instructions as MIPSInstruction[];
    }

    // MARK: - Symbol Table
    /**
     * Builds the symbol table for the given instructions.
     * This is step 1 of the two-pass assembler, so our only
     * job is to build the symbol table. We do not replace
     * or remove any tokens in this step.
     */
    private buildSymbolTable() {
        const instructions = this.instructions;
        // Start at the beginning of where the program will be stored
        let segment: '.text' | '.data' = '.text';
        const locationCounter = {
            '.text': this.symbolTable['.text'],
            '.data': this.symbolTable['.data'],
        };
        for (const line of instructions) {
            const [command, ...args] = line.split(' ');
            // Check if the line is a directive to change data segments
            if (isMIPSAssemblerDirective(command)) {
                if (line === '.text' || line === '.data') {
                    segment = line;
                }

                // Build the directive
                const directive = new AssemblerDirective(this, command, args, locationCounter[segment]);

                // Calculate the forward offset
                const forwardOffset = directive.calculateForwardOffset();

                // Update the location counter
                locationCounter[segment] += forwardOffset;
            } else if (isValidLabel(command)) {
                // It's a label, add it to the symbol table (but remove the colon)
                const label = command.slice(0, -1);
                this.symbolTable[label] = locationCounter[segment]; // Labels are always 4 bytes ahead
            } else {
                // It's a standard 32 bit MIPS instruction, increment the location counter by 4
                locationCounter[segment] += 4;
            }
        }
        this.instructions = instructions;
    }

    // MARK: - Validation
    /**
     * Validates the given instructions.
     *
     * @throws An error if the instructions are invalid
     */
    private validate() {
        const instructions = this.instructions;
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
                    MIPS_INSTRUCTIONS[word].validate(args);
                } catch (e) {
                    throw new MIPSErrors.MIPSAssemblerInstructionSyntaxError(word, index);
                }
            else if (isValidLabel(word)) {
                // It's a label, no need to throw an error here.
            } else throw new MIPSErrors.MIPSAssemblerSyntaxError(instruction, index);
        }
    }

    // MARK: - Assembly
    /**
     * Assembles the given instructions into machine code.
     *
     * @param instructions The instructions to be assembled
     * @returns The machine code generated from the instructions
     */
    private assembleInstructions(instructions: MIPSInstruction[]): Uint32Array {
        const machineCode = new Uint32Array(instructions.length);
        const view = new DataView(machineCode.buffer);
        let bufferPointer = 0;
        // At this stage, each line should be a single valid MIPS instruction.
        // No need to check for labels or directives.
        for (const instruction of instructions) {
            const op = instruction.split(' ')[0] as MIPS_OP;
            const [, ...args] = instruction.split(' ');
            let rawInstruction = 0x00000000000000000000000000000000;
            const instructionDetails = MIPS_INSTRUCTIONS[op];
            // Get the 6 bit opcode
            const opCode = instructionDetails.opCode;
            rawInstruction |= opCode << (32 - 6);
            switch (op) {
                // MARK:  Arithmetic I Type
                case 'addi':
                case 'addiu':
                case 'andi':
                case 'ori':
                case 'xori':
                case 'slti':
                case 'sltiu':
                    // 0xOOOOOSSSSSTTTTTIIIIIIIIIIIIIIII
                    // Get the registers
                    const [rt__, rs__] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    const immediate_ = parseInt(args[2]);
                    rawInstruction |= rs__ << (26 - 5);
                    rawInstruction |= rt__ << (21 - 5);
                    rawInstruction |= (immediate_ & 0xffff) << (16 - 16);
                    break;

                // MARK: Load and Store
                // NOTE: This isn't the standard MIPS format, but it's easier to parse
                case 'lw':
                case 'lh':
                case 'lhu':
                case 'lb':
                case 'lbu':
                case 'll':
                case 'sw':
                case 'sb':
                case 'sh':
                case 'sc':
                    // Incoming instruction is in form op $rt $rs, Offset
                    // 0xOOOOOSSSSSTTTTTIIIIIIIIIIIIIIII

                    // Sometimes there's no register passed in for the offset (i.e., lw $1 label)
                    // In that case, we need to use the $0 register b/c it translates to 000000.
                    // This "default" register gets placed as the first argument in the instruction.
                    if (args.length === 2) args.unshift('$0');

                    // Get the registers
                    const [rt___, rs___] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., lw $1 label), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    const offset = parseInt(args[2]);
                    rawInstruction |= rs___ << (26 - 5);
                    rawInstruction |= rt___ << (21 - 5);
                    rawInstruction |= (offset & 0xffff) << (16 - 16);
                    break;
                // MARK: Branch Equivalence
                case 'bne':
                case 'beq':
                    // 0xOOOOOSSSSSTTTTTIIIIIIIIIIIIIIII
                    // Get the registers
                    const [rs____, rt____] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);

                    const offset_ = parseInt(args[2]);
                    rawInstruction |= rs____ << (26 - 5);
                    rawInstruction |= rt____ << (21 - 5);
                    rawInstruction |= (offset_ & 0xffff) << (16 - 16);
                    break;

                // MARK: Branch Comparison
                case 'bgez':
                case 'bgezal':
                case 'bgtz':
                case 'blez':
                case 'bltz':
                case 'bltzal':
                    // 0xOOOOOSSSSSIIIIIIIIIIIIIIIIIIIII
                    // Get the registers
                    const [rs_____] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    const offset__ = parseInt(args[1]);
                    rawInstruction |= rs_____ << (26 - 5);
                    rawInstruction |= (offset__ & 0xffff) << (16 - 16);
                    break;

                // MARK: LUI
                case 'lui':
                    // 0xOOOOO00000TTTTTIIIIIIIIIIIIIIII
                    // Get the registers
                    const [rt____5] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    const immediate____5 = parseInt(args[1]);
                    rawInstruction |= rt____5 << (21 - 5);
                    rawInstruction |= (immediate____5 & 0xffff) << 0;
                    break;

                // MARK: Jump Register
                case 'jr':
                case 'jalr':
                    // 0xOOOOOSSSSS000000000000000001000
                    // Get the registers
                    const [rs____6] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    rawInstruction |= rs____6 << (26 - 5);
                    rawInstruction |= instructionDetails.funct! << (6 - 6);
                    break;

                // MARK: Arithmetic R Type
                case 'add':
                case 'addu':
                case 'and':
                case 'nor':
                case 'or':
                case 'slt':
                case 'sltu':
                case 'sub':
                case 'subu':
                case 'xor':
                case 'sllv':
                case 'srlv':
                case 'srav':
                    // 0xOOOOOOSSSSSTTTTTDDDDD00000FFFFFF
                    // Get the registers
                    const [rd, rs, rt] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    const shftAmt = 0;
                    const funct = instructionDetails.funct ?? 0;

                    rawInstruction |= rs << (26 - 5);
                    rawInstruction |= rt << (21 - 5);
                    rawInstruction |= rd << (16 - 5);
                    rawInstruction |= shftAmt << (11 - 5);
                    rawInstruction |= funct << (6 - 6);
                    break;
                // MARK: Shift
                case 'sll':
                case 'srl':
                case 'sra':
                    // 0xOOOOOO00000TTTTTDDDDDSSSSSFFFFFF
                    // Get the registers

                    const [rd_, rt_] = args
                        .map((reg) => reg ?? '$0') // If there's no register passed in for that argument (i.e., the jr command), use the $0 register b/c it translates to 000000
                        .filter(isValidRegister)
                        .map(registerLookup)
                        .map((reg) => reg.registerNumber);
                    const shftAmt_ = parseInt(args[2]);
                    const funct_ = instructionDetails.funct ?? 0;

                    // rawInstruction |= rs_ << (26 - 5); // No rs register
                    rawInstruction |= rt_ << (21 - 5);
                    rawInstruction |= rd_ << (16 - 5);
                    rawInstruction |= shftAmt_ << (11 - 5);
                    rawInstruction |= funct_ << (6 - 6);
                    break;

                // MARK: Jump
                case 'j':
                case 'jal':
                    // 0xOOOOOOIIIIIIIIIIIIIIIIIIIIIIIIII
                    // Get the immediate value
                    const immediate = parseInt(args[0]);
                    rawInstruction |= (immediate & 0x3ffffff) << (26 - 26);
                    break;
                case 'nop':
                    // 0x00000000000000000000000000000000  (nop)
                    break;

                // MARK: Non-Core
                case 'syscall':
                case 'break':
                case 'eret':
                    // 0xOOOOOO00000000000000000000FFFFFF
                    // Get the function code
                    const funct__ = instructionDetails.funct ?? 0;
                    rawInstruction |= funct__ << (6 - 6);
                    break;
                default:
                    throw new MIPSErrors.MIPSAssemblerError('Unknown Instruction: `' + instruction + '`');
            }

            view.setUint32(bufferPointer * 4, rawInstruction, false);

            bufferPointer += 1;
        }

        return machineCode;
    }
}

function convertCharLiterals(instruction) {
    return instruction.replace(/'((?:\\.|[^\\'])+)'/g, (match, char) => {
        if (char.length === 1) {
            return char.charCodeAt(0);
        } else if (char.length === 2 && char[0] === '\\') {
            switch (char[1]) {
                case 'n':
                    return 10;
                case 'r':
                    return 13;
                case 't':
                    return 9;
                case '\\':
                    return 92;
                case "'":
                    return 39;
                case '"':
                    return 34;
                case '0':
                    return 0;
                default:
                    throw new Error(`Invalid escape sequence: \\${char[1]}`);
            }
        } else {
            throw new Error(`Invalid character literal: ${match}`);
        }
    });
}

/**
 * This function takes a line of MIPS assembly code and
 * breaks it into an array.
 *
 * The break will be done by splitting the line by any
 * colon (:) characters that are not inside of a string.
 * This must be done manually without using a regex.
 */
function splitLabels(line: string): string[] {
    const parts = [];
    let currentPart = '';
    let inString = false;
    let inChar = false;
    for (const char of line) {
        if (char === '"') {
            inString = !inString;
        }
        if (char === "'") {
            inChar = !inChar;
        }
        if (char === ':' && !inString) {
            currentPart += char;
            parts.push(currentPart);
            currentPart = '';
        } else {
            currentPart += char;
        }
    }
    parts.push(currentPart);
    return parts;
}
