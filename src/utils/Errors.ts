// Custom error for MIPS Processor

// Inheritance Tree:
// Error
// └── MIPSProcessorError
//     ├── MIPSAssemblerError
//     │   ├── MIPSAssemblerSyntaxError
//     │   │   ├── MIPSAssemblerDirectiveSyntaxError
//     │   │   └── MIPSAssemblerInstructionSyntaxError
//     │   └── MIPSAssemblerDirectiveError
//     └── MIPSExecutionError
//         ├── MIPSExecutionMemoryError
//         └── MIPSExecutionRegisterError // For example, if a register is not found

export class MIPSProcessorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MIPSProcessorError';
    }
}

export class MIPSAssemblerError extends MIPSProcessorError {
    constructor(message: string, public line: number = 0) {
        super(message);
        this.name = 'MIPSAssemblerError';
    }

    public getLine(): number {
        return this.line;
    }
}

export class MIPSAssemblerSyntaxError extends MIPSAssemblerError {
    constructor(instruction: string, line: number, message: string = 'Invalid Syntax') {
        super(`${message} on line ${line}: ${instruction}`);
        this.name = 'MIPSAssemblerSyntaxError';
    }
}

export class MIPSAssemblerDirectiveSyntaxError extends MIPSAssemblerSyntaxError {
    constructor(directive: string, public line: number) {
        super(directive, line, 'Invalid Directive Syntax');
        this.name = 'MIPSAssemblerDirectiveSyntaxError';
    }
}

export class MIPSAssemblerInstructionSyntaxError extends MIPSAssemblerSyntaxError {
    constructor(instruction: string, public line: number) {
        super(instruction, line);
        this.name = 'MIPSAssemblerInstructionSyntaxError';
    }
}

export class MIPSAssemblerDirectiveError extends MIPSAssemblerError {
    constructor(directive: string, message: string, public line: number) {
        super(directive + ': ' + message);
        this.name = 'MIPSAssemblerDirectiveError';
    }
}

export class MIPSExecutionError extends MIPSProcessorError {
    constructor(message: string) {
        super(message);
        this.name = 'MIPSExecutionError';
    }
}

export class MIPSExecutionMemoryError extends MIPSExecutionError {
    constructor(message: string) {
        super(message);
        this.name = 'MIPSExecutionMemoryError';
    }
}

export class MIPSExecutionRegisterError extends MIPSExecutionError {
    constructor(message: string) {
        super(message);
        this.name = 'MIPSExecutionRegisterError';
    }
}
