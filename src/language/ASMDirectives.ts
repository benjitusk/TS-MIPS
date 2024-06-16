import { Assembler } from '../Assembler/assembler';

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
        const memory = this.assembler['memory'];
        switch (this.directive) {
            case '.align':
                // Nothing to do here, the forward offset will take care of alignment
                break;
            case '.ascii':
                // Store a string in memory but do not null-terminate it
                const ascii = this.args[0].slice(1, -1);
                const buffer = new Uint8Array(ascii.length);
                for (let i = 0; i < ascii.length; i++) {
                    buffer[i] = ascii.charCodeAt(i);
                }
                memory.write(this.locationCounter, buffer);
                break;
            case '.asciiz':
                // Store a string in memory and null-terminate it
                const asciiz = this.args[0].slice(1, -1);
                const bufferz = new Uint8Array(asciiz.length + 1);
                for (let i = 0; i < asciiz.length; i++) {
                    bufferz[i] = asciiz.charCodeAt(i);
                }
                bufferz[asciiz.length] = 0;
                memory.write(this.locationCounter, bufferz);
                break;
            case '.byte':
                // Store values in successive memory bytes
                const bytes = new Uint8Array(this.args.length);
                for (let i = 0; i < this.args.length; i++) {
                    bytes[i] = parseInt(this.args[i]);
                }
                memory.write(this.locationCounter, bytes);
                break;
            case '.data':
                // Switch to the data segment
                break;
            case '.double':
                // // Store double-precision floating-point values
                // for (const arg of this.args) {
                //     this.assembler.emitDouble(parseFloat(arg));
                // }
                console.warn('Double precision floating-point values are not supported');
                break;
            case '.float':
                // Store single-precision floating-point values
                console.warn('Single precision floating-point values are not supported');
                break;
            case '.half':
                // Store halfword values
                const halfwords = new Uint16Array(this.args.length);
                for (let i = 0; i < this.args.length; i++) {
                    halfwords[i] = parseInt(this.args[i]);
                }
                memory.write(this.locationCounter, new Uint8Array(halfwords.buffer));
                break;
            case '.space':
                // Allocate space in memory
                // Because this is a TS simulation, we don't need to allocate space
                // (it's all in memory already!)
                break;
            case '.text':
                // Switch to the text segment
                break;
            case '.word':
                // Store values in successive memory words
                const words = new Uint32Array(this.args.length);
                for (let i = 0; i < this.args.length; i++) {
                    words[i] = parseInt(this.args[i]);
                }
                memory.write(this.locationCounter, new Uint8Array(words.buffer));
                break;
            default:
                throw new Error(`Unknown directive: ${this.directive}`);
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
