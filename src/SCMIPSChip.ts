import _ from 'lodash';
import { Assembler } from './assembler/assembler';
import { Memory } from './components/memory';
import { PCU, RegisterFile } from './components/component';

class SingleCycleMIPSChip {
    /** The size of the processor memory in bytes */
    private MIPS_MEMORY_SIZE = 33554432; // 32 MiB

    /** The program counter (PC) register */
    private PC: number = 0;

    /** The speed of the internal processor clock */
    private CLOCK_SPEED = 1; // 1 kHz

    // MARK: - Internal Hardware

    /** Processor Memory */
    private memory = new Memory(this.MIPS_MEMORY_SIZE);

    /** Processor Registers */
    private registerFile = new RegisterFile();

    /** Processor Control Unit */
    private PCU = new PCU();

    /**
     * Runs the given program on the chip. The program is a string
     * containing valid MIPS assembly instructions separated by newlines.
     *
     * Each instruction is executed in a single clock cycle.
     *
     * @param program The program to be run by the chip
     */
    public run(program: string) {
        // Assemble the code into Uint32Array machine code instructions
        const assembler = new Assembler(this.memory);
        assembler.assemble(program, 0);

        // The program counter (PC) is initialized to 0
        this.PC = 0;

        // Start the clock cycle
        // this.startClock();
        this.tick();
    }

    private startClock() {
        // Set the clock interval to 1ms
        setInterval(() => this.tick(), this.CLOCK_SPEED);
    }

    // This method is called for each clock cycle
    private tick() {
        // Fetch the instruction at the PC
        const instruction = this.memory.readWord(this.PC);

        // Decode the instruction we just loaded.
        const opCode = instruction >>> 26;

        // Print the opcode
        console.log(`Opcode: 0x${opCode.toString(16)}`);
    }
}

export default SingleCycleMIPSChip;
