export class ALUControl {
    // The alu control has the following inputs:
    // 1. The ALUOp (2-bit) from the control unit
    // 2. The function code (6-bit) from the instruction

    /**
     * The input at ALUOp.
     */
    private aluOp: number = 0;

    /**
     * The input at Function Code.
     */
    private funct: number = 0;

    /**
     * Set the ALUOp input to the ALU Control.
     */
    public setALUOp(aluOp: number) {
        // The ALUOp is the 2 least significant bits of the opcode
        this.aluOp = aluOp & 0x3;
    }

    /**
     * Set the Function Code input to the ALU Control.
     */
    public setFunctionCode(funct: number) {
        // The function code is the 6 least significant bits of the instruction
        this.funct = funct & 0x3f;
    }
}
