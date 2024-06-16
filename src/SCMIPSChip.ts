import _ from 'lodash';
import { Assembler } from './assembler/assembler';
import { RAW_MIPS_REGISTER } from './language/MIPS';
import { Memory } from './components/memory';

class SingleCycleMIPSChip {
    /** Stores the values of the general-purpose registers */
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

    /** The size of the processor memory in bytes */
    private MIPS_MEMORY_SIZE = 33554432; // 32 MiB

    /** Processor Memory */
    private memory = new Memory(this.MIPS_MEMORY_SIZE);

    /** The program counter (PC) register */
    private PC: number = 0;

    /** The speed of the internal processor clock */
    private CLOCK_SPEED = 1; // 1 kHz

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
        const opCode = instruction & 0b11111100000000000000000000000000;

        // Print the opcode
        console.log([...new Uint8Array(opCode)].map((x) => x.toString(16).padStart(2, '0')).join(''));
    }
}

export default SingleCycleMIPSChip;
