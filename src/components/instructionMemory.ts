import { Connector, SingleOutputComponent } from '../hardware';
import { Memory } from './memory';

/**
 * The Instruction Memory of the MIPS Chip
 *
 * Given an address, it returns the instruction at that address.
 */
export class InstructionMemory extends SingleOutputComponent<32> {
    public readonly addressInput: Connector<32>;
    private memory: Memory;

    constructor(programMemory: Memory) {
        super(32);
        this.addressInput = new Connector(32);
        this.memory = programMemory;
    }

    protected _update(): void {
        this.output.setValue(this.memory.readWord(this.addressInput.getValue()));
    }
}
