import { Assembler } from '../utils/assembler';

export const MIPS_ASSEMBLER_DIRECTIVES = {
    '.align': {
        description: 'Align the next data on a word boundary',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length !== 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the argument is a number
            if (!/^\d+$/.test(args[0])) throw new Error(`Invalid argument: ${args[0]}`);
        },
    },
    '.ascii': {
        description: 'Store a string in memory but do not null-terminate it',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length !== 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the argument is a string
            if (!/^".*"$/.test(args[0])) throw new Error(`Invalid argument: ${args[0]}`);
        },
    },
    '.asciiz': {
        description: 'Store a string in memory and null-terminate it',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length !== 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the argument is a string
            if (!/^".*"$/.test(args[0])) throw new Error(`Invalid argument: ${args[0]}`);
        },
    },
    '.byte': {
        description: 'Store values in successive memory bytes',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length < 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the arguments are numbers
            for (const arg of args) {
                if (!/^-?\d+$/.test(arg)) throw new Error(`Invalid argument: ${arg}`);
            }
        },
    },
    '.data': {
        description: 'Switch to the data segment',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length !== 0) throw new Error(`Invalid number of arguments: ${args}`);
        },
    },
    '.double': {
        description: 'Store double-precision floating-point values',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length < 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the arguments are numbers
            for (const arg of args) {
                if (!/^-?\d+$/.test(arg)) throw new Error(`Invalid argument: ${arg}`);
            }
        },
    },
    '.float': {
        description: 'Store single-precision floating-point values',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length < 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the arguments are numbers
            for (const arg of args) {
                if (!/^-?\d+$/.test(arg)) throw new Error(`Invalid argument: ${arg}`);
            }
        },
    },
    '.half': {
        description: 'Store halfword values',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length < 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the arguments are numbers
            for (const arg of args) {
                if (!/^-?\d+$/.test(arg)) throw new Error(`Invalid argument: ${arg}`);
            }
        },
    },
    '.space': {
        description: 'Allocate space in memory',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length !== 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the argument is a number
            if (!/^\d+$/.test(args[0])) throw new Error(`Invalid argument: ${args[0]}`);
        },
    },
    '.text': {
        description: 'Switch to the text segment',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length !== 0) throw new Error(`Invalid number of arguments: ${args}`);
        },
    },
    '.word': {
        description: 'Store values in successive memory words',
        validate: (args: string[]) => {
            // Check the number of arguments
            if (args.length < 1) throw new Error(`Invalid number of arguments: ${args}`);
            // Check the arguments are numbers
            for (const arg of args) {
                if (!/^-?\d+$/.test(arg)) throw new Error(`Invalid argument: ${arg}`);
            }
        },
    },
} as const;

export type MIPSAssemblerDirective = keyof typeof MIPS_ASSEMBLER_DIRECTIVES;

export function isMIPSAssemblerDirective(directive: string): directive is MIPSAssemblerDirective {
    return MIPS_ASSEMBLER_DIRECTIVES[directive as MIPSAssemblerDirective] !== undefined;
}

/**
 * Represents an assembler directive in the MIPS assembly language.
 */
export class AssemblerDirective {
    args: string[];
    assembler: Assembler;
    directive: MIPSAssemblerDirective;
    locationCounter: number;

    /**
     * Creates a new instance of the AssemblerDirective class.
     * @param assembler The assembler instance.
     * @param directive The MIPS assembler directive.
     * @param args The arguments for the directive.
     * @param locationCounter The current location counter.
     */
    constructor(assembler: Assembler, directive: MIPSAssemblerDirective, args: string[], locationCounter: number) {
        this.args = args;
        this.assembler = assembler;
        this.directive = directive;
        this.locationCounter = locationCounter;
    }

    /**
     * Executes the assembler directive.
     * @param locationCounter The current location counter.
     */
    execute() {
        // See https://github.com/microsoft/TypeScript/issues/19335 for accessing private properties of a class

        switch (this.directive) {
        }
    }

    /**
     * Calculates the forward offset for the assembler directive.
     * @returns The forward offset.
     */
    calculateForwardOffset(): number {
        switch (this.directive) {
            case '.align':
                // Depending on the current location counter, we may need to align to the next word boundary
                const alignment = parseInt(this.args[0]);
                const remainder = alignment - (this.locationCounter % alignment);
                return remainder === alignment ? 0 : remainder;
            case '.ascii':
                return this.args[0].length;
            case '.asciiz':
                return this.args[0].length + 1;
            case '.byte':
                return this.args.length;
            case '.data':
                return 0;
            case '.double':
                return this.args.length * 8;
            case '.float':
                return this.args.length * 4;
            case '.half':
                return this.args.length * 2;
            case '.space':
                return parseInt(this.args[0]);
            case '.text':
                return 0;
            case '.word':
                return this.args.length * 4;
            default:
                throw new Error(`Unknown directive: ${this.directive}`);
        }
    }
}
