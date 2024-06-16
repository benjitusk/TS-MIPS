/**
 * The MIPS register file.
 */

import { RAW_MIPS_REGISTER } from '../language/MIPS';
type bit = 0 | 1;
type byte = [bit, bit, bit, bit, bit, bit, bit, bit];
type word = [...byte, ...byte, ...byte, ...byte];

abstract class Component {
    abstract tick(): void;
}

export class RegisterFile extends Component {
    /**
     * The private registers of the MIPS register file.
     */
    private registers: { [key in RAW_MIPS_REGISTER]: number } = {
        $0: 0,
        $1: 0,
        $2: 0,
        $3: 0,
        $4: 0,
        $5: 0,
        $6: 0,
        $7: 0,
        $8: 0,
        $9: 0,
        $10: 0,
        $11: 0,
        $12: 0,
        $13: 0,
        $14: 0,
        $15: 0,
        $16: 0,
        $17: 0,
        $18: 0,
        $19: 0,
        $20: 0,
        $21: 0,
        $22: 0,
        $23: 0,
        $24: 0,
        $25: 0,
        $26: 0,
        $27: 0,
        $28: 0,
        $29: 0,
        $30: 0,
        $31: 0,
    };

    /**
     * The input at Read Register 1.
     */
    public readRegister1: number = 0;

    /**
     * The input at Read Register 2.
     */
    public readRegister2: number = 0;

    /**
     * The input at Write Register.
     */
    public writeRegister: number = 0;

    /**
     * The input at Write Data. (32-bit)
     */
    public writeData: word = new Array(32).fill(0) as word;

    /**
     * The input at Write Enable.
     */
    public writeEnable: bit = 0;

    /**
     * The output at Read Data 1.
     */
    public readData1: word = new Array(32).fill(0) as word;

    /**
     * The output at Read Data 2.
     */
    public readData2: word = new Array(32).fill(0) as word;

    /**
     * Execute a clock cycle.
     */
    public tick() {
        // Read the registers
        // Do stuff with the registers
        // Write to the registers
        // Set the output
    }
}

export class PCU extends Component {
    /**
     * The opcode of the current instruction.
     */
    public opcode: number = 0;

    /**
     * The outputs of the PCU.
     */
    public output: {
        ALUOp: number;
        ALUSrc: number;
        Branch: number;
        Jump: number;
        MemRead: number;
        MemToReg: number;
        MemWrite: number;
        RegDst: number;
        RegWrite: number;
    } = {
        ALUOp: 0,
        ALUSrc: 0,
        Branch: 0,
        Jump: 0,
        MemRead: 0,
        MemToReg: 0,
        MemWrite: 0,
        RegDst: 0,
        RegWrite: 0,
    };
    public tick() {
        // Read the instruction
        // Decode the instruction
        // Set the output
    }
}
