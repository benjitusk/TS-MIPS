import { Connector, DualOutputComponent } from '../hardware';
import { RAW_MIPS_REGISTER } from '../language/MIPS';
import { word, bit } from '../types';

export class RegisterFile extends DualOutputComponent<32, 32> {
    public readonly readRegisterOne = new Connector(5); // 5 bit register number
    public readonly readRegisterTwo = new Connector(5); // 5 bit register number

    public readonly writeRegister = new Connector(5); // 5 bit register number
    public readonly writeData = new Connector(32); // 32 bit data to put into register

    public readonly regWrite = new Connector(1); // Control line to allow writing to register

    constructor() {
        super(32, 32);
    }

    protected _update(): void {
        throw new Error('Method not implemented.');
    }
    /**
     * The private registers of the MIPS register file.
     */
    private readonly registers: {
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
}
