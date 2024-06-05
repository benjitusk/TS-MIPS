const MIPS_CORE_INSTRUCTION_SET = [
    'add',
    'addi',
    'addiu',
    'addu',
    'and',
    'andi',
    'beq',
    'bne',
    'j',
    'jal',
    'jr',
    'lbu',
    'lhu',
    'll',
    'lui',
    'lw',
    'nor',
    'or',
    'ori',
    'slt',
    'slti',
    'sltiu',
    'sltu',
    'sll',
    'srl',
    'sb',
    'sc',
    'sh',
    'sw',
    'sub',
    'subu',
] as const;

export const MIPS_CORE_INSTRUCTIONS = {
    add: {
        type: 'R',
        opCode: 0,
        description: 'Add the values at RS and RT, and store the result of the operation in RD.',
        funct: 0x20,
        validate: (args) => {
            if (args.length !== 3) throw new Error('add requires 3 arguments (rd, rs, rt)');
        },
    },
    addi: {
        type: 'I',
        opCode: 0x08,
        description: 'Add the value at RT to the sign-extended immediate value',
        validate: (args) => {
            if (args.length !== 3) throw new Error('addi requires 3 arguments (rt, rs, immediate)');
        },
    },
    addiu: {
        type: 'I',
        opCode: 0x09,
        description: 'Add the value at RT to the sign-extended immediate value, and treat them as unsigned integers',
        validate: (args) => {
            if (args.length !== 3) throw new Error('addiu requires 3 arguments (rt, rs, immediate)');
        },
    },
    addu: {
        type: 'R',
        opCode: 0,
        description: 'Add the values at RS and RT, and store the result of the operation in RD (unsigned)',
        funct: 0x21,
        validate: (args) => {
            if (args.length !== 3) throw new Error('addu requires 3 arguments (rd, rs, rt)');
        },
    },
    and: {
        type: 'R',
        opCode: 0,
        description: 'Perform a binary AND operation of RS and RT and store the result in RD',
        funct: 0x24,
        validate: (args) => {
            if (args.length !== 3) throw new Error('and requires 3 arguments (rd, rs, rt)');
        },
    },
    andi: {
        type: 'I',
        opCode: 0x0c,
        description:
            'Perform a binary AND operation of RS and the zero-extended immediate value and store the result in RT',
        validate: (args) => {
            if (args.length !== 3) throw new Error('andi requires 3 arguments (rt, rs, immediate)');
        },
    },
    beq: {
        type: 'I',
        opCode: 0x04,
        description: 'Compare the values of RS and RT. If they ARE equal, change the PC to the Branch Address + 4',
        validate: (args) => {
            if (args.length !== 3) throw new Error('beq requires 3 arguments (rs, rt, offset)');
        },
    },
    bne: {
        type: 'I',
        opCode: 0x05,
        description: 'Compare the values of RS and RT. If they are NOT equal, change the PC to the Branch Address + 4',
        validate: (args) => {
            if (args.length !== 3) throw new Error('bne requires 3 arguments (rs, rt, offset)');
        },
    },
    j: {
        type: 'J',
        opCode: 0x02,
        description: 'Unconditionally set the PC to the jump address',
        validate: (args) => {
            if (args.length !== 1) throw new Error('j requires 1 argument (address)');
        },
    },
    jal: {
        type: 'J',
        opCode: 0x03,
        description: 'Unconditionally set the PC to the jump address. Store PC + 4 in the $ra register ($31)',
        validate: (args) => {
            if (args.length !== 1) throw new Error('jal requires 1 argument (address)');
        },
    },
    jr: {
        type: 'R',
        opCode: 0,
        description: 'Change the PC to the address stored in RS',
        funct: 0x08,
        validate: (args) => {
            if (args.length !== 1) throw new Error('jr requires 1 argument (rs)');
        },
    },
    lbu: {
        type: 'I',
        opCode: 0x24,
        description:
            'Read a single byte from memory at the address specified at RS (plus the specified offset). Zero extend it to 32 bits, and store the result in RT',
        validate: (args) => {
            if (args.length !== 3) throw new Error('lbu requires 3 arguments (rt, offset, rs)');
        },
    },
    lhu: {
        type: 'I',
        opCode: 0x25,
        description:
            'Read a half word (2 bytes) from memory at the address specified at RS (plus the specified offset). Zero extend it to 16 bits, and store the result in RT',
        validate: (args) => {
            if (args.length !== 3) throw new Error('lhu requires 3 arguments (rt, offset, rs)');
        },
    },
    ll: {
        type: 'I',
        opCode: 0x30,
        description:
            'Load linked word. Atomically loads a word from memory into RT and marks the address as reserved for a subsequent store-conditional operation.',
        validate: (args) => {
            if (args.length !== 2) throw new Error('ll requires 2 arguments (rt, offset)');
        },
    },
    lui: {
        type: 'I',
        opCode: 0x0f,
        description: 'Load upper immediate. Load the immediate value shifted left by 16 bits into the RT register.',
        validate: (args) => {
            if (args.length !== 2) throw new Error('lui requires 2 arguments (rt, immediate)');
        },
    },
    lw: {
        type: 'I',
        opCode: 0x23,
        description: 'Read a word (4 bytes) from memory at the address specified at RS (plus the specified offset).',
        validate: (args) => {
            if (args.length !== 3) throw new Error('lw requires 3 arguments (rt, offset, rs)');
        },
    },
    nor: {
        type: 'R',
        opCode: 0,
        description: 'Perform a bitwise NOR operation of RS and RT and store the result in RD.',
        funct: 0x27,
        validate: (args) => {
            if (args.length !== 3) throw new Error('nor requires 3 arguments (rd, rs, rt)');
        },
    },
    or: {
        type: 'R',
        opCode: 0,
        description: 'Perform a bitwise OR of RS and RT and store the result in RD',
        funct: 0x25,
        validate: (args) => {
            if (args.length !== 3) throw new Error('or requires 3 arguments (rd, rs, rt)');
        },
    },
    ori: {
        type: 'I',
        opCode: 0x0d,
        description: 'Perform a bitwise OR of RS and the zero-extended immediate value and store the result in RT',
        validate: (args) => {
            if (args.length !== 3) throw new Error('ori requires 3 arguments (rt, rs, immediate)');
        },
    },
    sb: {
        type: 'I',
        opCode: 0x28,
        description: 'Store byte. Store the least significant byte of RT at the specified memory address.',
        validate: (args) => {
            if (args.length !== 3) throw new Error('sb requires 3 arguments (rt, offset, base)');
        },
    },

    sc: {
        type: 'I',
        opCode: 0x38,
        description:
            'Store conditional word. Stores the value in RT to the address reserved by the last LL operation if it has not been modified by other processors since the LL operation.',
        validate: (args) => {
            if (args.length !== 2) throw new Error('sc requires 2 arguments (rt, offset)');
        },
    },
    sh: {
        type: 'I',
        opCode: 0x29,
        description: 'Store half word. Store the least significant half-word of RT at the specified memory address.',
        validate: (args) => {
            if (args.length !== 3) throw new Error('sh requires 3 arguments (rt, offset, base)');
        },
    },
    slt: {
        type: 'R',
        opCode: 0,
        description: 'Set RD to 1 if RS is less than RT, otherwise set RD to 0',
        funct: 0x2a,
        validate: (args) => {
            if (args.length !== 3) throw new Error('slt requires 3 arguments (rd, rs, rt)');
        },
    },
    slti: {
        type: 'I',
        opCode: 0x0a,
        description: 'Set RT to 1 if RS is less than the immediate value, otherwise set RT to 0',
        validate: (args) => {
            if (args.length !== 3) throw new Error('slti requires 3 arguments (rt, rs, immediate)');
        },
    },
    sltiu: {
        type: 'I',
        opCode: 0x0b,
        description: 'Set RT to 1 if RS is less than the immediate value (unsigned), otherwise set RT to 0',
        validate: (args) => {
            if (args.length !== 3) throw new Error('sltiu requires 3 arguments (rt, rs, immediate)');
        },
    },
    sltu: {
        type: 'R',
        opCode: 0,
        description: 'Set RD to 1 if RS is less than RT (unsigned), otherwise set RD to 0.',
        funct: 0x2b,
        validate: (args) => {
            if (args.length !== 3) throw new Error('sltu requires 3 arguments (rd, rs, rt)');
        },
    },

    sll: {
        type: 'R',
        opCode: 0,
        description: 'Shift the value in RT left by the specified number of bits and store the result in RD',
        funct: 0x00,
        validate: (args) => {
            if (args.length !== 3) throw new Error('sll requires 3 arguments (rd, rt, shamt)');
        },
    },
    srl: {
        type: 'R',
        opCode: 0,
        description: 'Shift the value in RT right by the specified number of bits and store the result in RD',
        funct: 0x02,
        validate: (args) => {
            if (args.length !== 3) throw new Error('srl requires 3 arguments (rd, rt, shamt)');
        },
    },
    sub: {
        type: 'R',
        opCode: 0,
        description: 'Subtract the value in RT from the value in RS and store the result in RD',
        funct: 0x22,
        validate: (args) => {
            if (args.length !== 3) throw new Error('sub requires 3 arguments (rd, rs, rt)');
        },
    },
    subu: {
        type: 'R',
        opCode: 0,
        description: 'Subtract the value in RT from the value in RS and store the result in RD (unsigned)',
        funct: 0x23,
        validate: (args) => {
            if (args.length !== 3) throw new Error('subu requires 3 arguments (rd, rs, rt)');
        },
    },
    sw: {
        type: 'I',
        opCode: 0x2b,
        description: 'Store word. Store the value in RT at the specified memory address.',
        validate: (args) => {
            if (args.length !== 3) throw new Error('sw requires 3 arguments (rt, offset, base)');
        },
    },
} as {
    [key in MIPS_OP]: {
        type: 'J' | 'I' | 'R';
        opCode: number;
        description: string;
        validate: (args: string[]) => void;
    };
};

export function validateInstruction(instruction: MIPS_OP, args: string[]): void {
    // Check what type the instruction is
    const type = MIPS_CORE_INSTRUCTIONS[instruction].type;

    switch (type) {
        case 'R':
            // The syntax for R-type instructions is: op rd, rs, rt
            if (args.length !== 3) throw 'Invalid number of arguments';
            break;
        case 'I':
            // Check if the number of arguments is correct
            if (args.length !== 3) throw 'Invalid number of arguments';
            break;
        case 'J':
            // Check if the number of arguments is correct
            if (args.length !== 1) throw 'Invalid number of arguments';
            break;
    }
}

export type MIPS_OP = (typeof MIPS_CORE_INSTRUCTION_SET)[number];

export function isMIPSInstruction(instruction: string): instruction is MIPS_OP {
    return MIPS_CORE_INSTRUCTIONS[instruction as MIPS_OP] !== undefined;
}

const REGISTER_UNALIAS = {
    $zero: '$0',
    $at: '$1',
    $v0: '$2',
    $v1: '$3',
    $a0: '$4',
    $a1: '$5',
    $a2: '$6',
    $a3: '$7',
    $t0: '$8',
    $t1: '$9',
    $t2: '$10',
    $t3: '$11',
    $t4: '$12',
    $t5: '$13',
    $t6: '$14',
    $t7: '$15',
    $s0: '$16',
    $s1: '$17',
    $s2: '$18',
    $s3: '$19',
    $s4: '$20',
    $s5: '$21',
    $s6: '$22',
    $s7: '$23',
    $t8: '$24',
    $t9: '$25',
    $k0: '$26',
    $k1: '$27',
    $gp: '$28',
    $sp: '$29',
    $fp: '$30',
    $ra: '$31',
} as const;

export type RAW_MIPS_REGISTER = (typeof REGISTER_UNALIAS)[keyof typeof REGISTER_UNALIAS];
export type ALIAS_MIPS_REGISTER = keyof typeof REGISTER_UNALIAS;
export type MIPS_REGISTER = RAW_MIPS_REGISTER | ALIAS_MIPS_REGISTER;
// (Use the above list as an alias reference)
const MIPS_REGISTERS = {
    $0: {
        alias: '$zero',
        description: 'Hard-wired to Zero',
        registerNumber: 0b00000,
    },
    $1: {
        alias: '$at',
        description: 'Reserved for pseudo-instructions',
        registerNumber: 0b00001,
    },
    $2: {
        alias: '$v0',
        description: 'Return value from function',
        registerNumber: 0b00010,
    },
    $3: {
        alias: '$v1',
        description: 'Return value from function',
        registerNumber: 0b00011,
    },
    $4: {
        alias: '$a0',
        description: 'Argument to functions',
        registerNumber: 0b00100,
    },
    $5: {
        alias: '$a1',
        description: 'Argument to functions',
        registerNumber: 0b00101,
    },
    $6: {
        alias: '$a2',
        description: 'Argument to functions',
        registerNumber: 0b00110,
    },
    $7: {
        alias: '$a3',
        description: 'Argument to functions',
        registerNumber: 0b00111,
    },
    $8: {
        alias: '$t0',
        description: 'Temporary',
        registerNumber: 0b01000,
    },
    $9: {
        alias: '$t1',
        description: 'Temporary',
        registerNumber: 0b01001,
    },
    $10: {
        alias: '$t2',
        description: 'Temporary',
        registerNumber: 0b01010,
    },
    $11: {
        alias: '$t3',
        description: 'Temporary',
        registerNumber: 0b01011,
    },
    $12: {
        alias: '$t4',
        description: 'Temporary',
        registerNumber: 0b01100,
    },
    $13: {
        alias: '$t5',
        description: 'Temporary',
        registerNumber: 0b01101,
    },
    $14: {
        alias: '$t6',
        description: 'Temporary',
        registerNumber: 0b01110,
    },
    $15: {
        alias: '$t7',
        description: 'Temporary',
        registerNumber: 0b01111,
    },
    $16: {
        alias: '$s0',
        description: 'Saved',
        registerNumber: 0b10000,
    },
    $17: {
        alias: '$s1',
        description: 'Saved',
        registerNumber: 0b10001,
    },
    $18: {
        alias: '$s2',
        description: 'Saved',
        registerNumber: 0b10010,
    },
    $19: {
        alias: '$s3',
        description: 'Saved',
        registerNumber: 0b10011,
    },
    $20: {
        alias: '$s4',
        description: 'Saved',
        registerNumber: 0b10100,
    },
    $21: {
        alias: '$s5',
        description: 'Saved',
        registerNumber: 0b10101,
    },
    $22: {
        alias: '$s6',
        description: 'Saved',
        registerNumber: 0b10110,
    },
    $23: {
        alias: '$s7',
        description: 'Saved',
        registerNumber: 0b10111,
    },
    $24: {
        alias: '$t8',
        description: 'Temporary',
        registerNumber: 0b11000,
    },
    $25: {
        alias: '$t9',
        description: 'Temporary',
        registerNumber: 0b11001,
    },
    $26: {
        alias: '$k0',
        description: 'Reserved for OS kernel',
        registerNumber: 0b11010,
    },
    $27: {
        alias: '$k1',
        description: 'Reserved for OS kernel',
        registerNumber: 0b11011,
    },
    $28: {
        alias: '$gp',
        description: 'Global pointer',
        registerNumber: 0b11100,
    },
    $29: {
        alias: '$sp',
        description: 'Stack pointer',
        registerNumber: 0b11101,
    },
    $30: {
        alias: '$fp',
        description: 'Frame pointer (or $s8)',
        registerNumber: 0b11110,
    },
    $31: {
        alias: '$ra',
        description: 'Return address',
        registerNumber: 0b11111,
    },
} as {
    [key in RAW_MIPS_REGISTER]: {
        alias: string;
        description: string;
    };
};

function isValidRegister(register: string): register is MIPS_REGISTER {
    return (
        // It could be a raw register ($17, for example)
        MIPS_REGISTERS[register as RAW_MIPS_REGISTER] !== undefined ||
        // Or a register alias ($s1, for example)
        MIPS_REGISTERS[REGISTER_UNALIAS[register as ALIAS_MIPS_REGISTER]] !== undefined
    );
}
