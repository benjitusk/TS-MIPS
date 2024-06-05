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

export class AssemblerDirective {
    args: string[];
    assembler: Assembler;
    directive: MIPSAssemblerDirective;
    constructor(assembler: Assembler, directive: MIPSAssemblerDirective, args: string[]) {
        this.args = args;
        this.assembler = assembler;
        this.directive = directive;
    }

    execute(locationCounter: number) {
        // See https://github.com/microsoft/TypeScript/issues/19335 for accessing private properties of a class
        const dataToWrite = new Uint8Array();
        console.warn(`Assembler Directive ${this.directive} not implemented, writing empty data!`);
        this.assembler['memory'].write(locationCounter, dataToWrite);
    }

    calculateForwardOffset(): number {
        return 0;
    }
}
