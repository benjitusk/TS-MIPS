import { RAW_MIPS_REGISTER } from '../language/MIPS';
import { word, bit } from '../types';

export class RegisterFile {
    /**
     * The private registers of the MIPS register file.
     */
    private registers: {
        [key in RAW_MIPS_REGISTER]: number;
    } = {
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
    public execute() {
        // Read the registers
        // Do stuff with the registers
        // Write to the registers
        // Set the output
    }
}
