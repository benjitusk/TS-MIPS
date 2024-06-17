/**
 * The MIPS register file.
 */

export class PCU {
    /**
     * The opcode of the current instruction.
     */
    private opcode: number = 0;

    /**
     * Set the opcode of the current instruction.
     */
    public setOpcode(opcode: number) {
        this.opcode = opcode;
    }

    /**
     * Execute a clock cycle.
     */
    public execute() {
        // Do stuff with the opcode
    }
}
