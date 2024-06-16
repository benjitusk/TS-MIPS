interface MIPSInstructionAST {
    operation: string;
    operands: (RegisterOperand | ImmediateOperand | MemoryOperand)[];
}

interface RegisterOperand {
    type: 'register';
    value: string;
}

interface ImmediateOperand {
    type: 'immediate';
    value: number | string; // number for immediate values, string for labels
}

interface MemoryOperand {
    type: 'memory';
    offset: string | number;
    base: string;
}

export class Tokenizer {
    /**
     * Tokenizes a valid MIPS instruction and returns an AST.
     *
     * @param instruction - The MIPS instruction string to tokenize.
     * @returns An AST representing the instruction.
     */
    public static parse(instruction: string): MIPSInstructionAST {
        const tokens = Tokenizer.tokenize(instruction);
        return Tokenizer.buildAST(tokens);
    }

    /**
     * Tokenizes the instruction string into an array of tokens.
     *
     * @param instruction - The MIPS instruction string to tokenize.
     * @returns An array of tokens.
     */
    private static tokenize(instruction: string): string[] {
        instruction = instruction.trim();

        const tokens: string[] = [];
        let currentToken = '';
        let insideParentheses = false;

        for (let char of instruction) {
            if (char === ' ' || char === ',') {
                if (insideParentheses) {
                    currentToken += char;
                } else {
                    if (currentToken) {
                        tokens.push(currentToken);
                        currentToken = '';
                    }
                }
            } else if (char === '(') {
                insideParentheses = true;
                currentToken += char;
            } else if (char === ')') {
                insideParentheses = false;
                currentToken += char;
                tokens.push(currentToken);
                currentToken = '';
            } else {
                currentToken += char;
            }
        }

        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    }

    /**
     * Builds an AST from an array of tokens.
     *
     * @param tokens - An array of tokens.
     * @returns An AST representing the instruction.
     */
    private static buildAST(tokens: string[]): MIPSInstructionAST {
        const operation = tokens.shift()!;
        const operands = tokens.map((token) => Tokenizer.parseOperand(token));

        return {
            operation,
            operands,
        };
    }

    /**
     * Parses a token into an operand.
     *
     * @param token - The token to parse.
     * @returns An operand object.
     */
    private static parseOperand(token: string): RegisterOperand | ImmediateOperand | MemoryOperand {
        if (token.includes('(')) {
            const match = token.match(/([-\w]+)?\((\$\w+)\)/);
            if (match) {
                return {
                    type: 'memory',
                    offset: match[1] ? (isNaN(Number(match[1])) ? match[1] : Number(match[1])) : 0,
                    base: match[2],
                } as MemoryOperand;
            }
        } else if (token.startsWith('$')) {
            return {
                type: 'register',
                value: token,
            } as RegisterOperand;
        } else if (!isNaN(Number(token))) {
            return {
                type: 'immediate',
                value: Number(token),
            } as ImmediateOperand;
        }

        return {
            type: 'immediate',
            value: token,
        } as ImmediateOperand;
    }
}
