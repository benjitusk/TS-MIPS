import _ from 'lodash';
import { Assembler } from './assembler/assembler';
import { Memory } from './components/memory';
import { PCU } from './components/PCU';
import { RegisterFile } from './components/RegisterFile';
import { MUX } from './components/mux';
import { SignExtender16To32 } from './components/signExtender';
import { ALUControl } from './components/aluControl';

class BITMASKS {
    public static readonly OPCODE = 0b11111100000000000000000000000000;
    public static readonly RS = 0b00000011111000000000000000000000;
    public static readonly RT = 0b00000000000111110000000000000000;
    public static readonly RD = 0b00000000000000001111100000000000;
    public static readonly SHAMT = 0b00000000000000000000011111000000;
    public static readonly FUNCT = 0b00000000000000000000000000111111;
    public static readonly IMMEDIATE = 0b00000000000000001111111111111111;
    public static readonly ADDRESS = 0b00000011111111111111111111111111;

    public static readonly OPCODE_SHIFT = 26;
    public static readonly RS_SHIFT = 21;
    public static readonly RT_SHIFT = 16;
    public static readonly RD_SHIFT = 11;
    public static readonly SHAMT_SHIFT = 6;
    public static readonly FUNCT_SHIFT = 0;
    public static readonly IMMEDIATE_SHIFT = 0;
    public static readonly ADDRESS_SHIFT = 0;
}

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

    /** MUX at register file write register */
    private writeRegisterMUX = new MUX();

    /** 16 to 32 bit sign extender */
    private signExtender = new SignExtender16To32();

    /** ALU Control Unit */
    private ALUControl = new ALUControl();

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
        this.fetchInstruction();
        this.decodeInstruction();
        this.executeInstruction();
        this.memoryAccess();
        this.writeBack();
    }

    private fetchInstruction() {
        // Fetch the instruction from memory at the address in the PC
        const instruction = this.memory.readWord(this.PC);

        // Break out the instruction into its component parts
        // Opcode, Rs, Rt, Rd, Shamt, Funct, Immediate, Address

        /**
         * The opcode of the instruction.
         *
         * The PCU will use this to determine the type of instruction.
         *
         * The opcode is the first 6 bits of the instruction. [31:26]
         */
        const opcode = (instruction & BITMASKS.OPCODE) >>> BITMASKS.OPCODE_SHIFT;

        /**
         * The source register for the instruction.
         *
         * The register file will use this to read the value from the register.
         *
         * The source register occupies the bits [25:21] of the instruction.
         */
        const rs = (instruction & BITMASKS.RS) >>> BITMASKS.RS_SHIFT;

        /**
         * The target register for the instruction.
         *
         * The register file will use this to read the value from the register.
         *
         * The target register occupies the bits [20:16] of the instruction.
         */
        const rt = (instruction & BITMASKS.RT) >>> BITMASKS.RT_SHIFT;

        /**
         * The destination register for the instruction.
         *
         * The register file will use this to write the value to the register.
         *
         * The destination register occupies the bits [15:11] of the instruction.
         */
        const rd = (instruction & BITMASKS.RD) >>> BITMASKS.RD_SHIFT;

        /**
         * The shift amount for the instruction.
         *
         * The ALU will use this to perform shift operations.
         *
         * The shift amount occupies the bits [10:6] of the instruction.
         */
        const shamt = (instruction & BITMASKS.SHAMT) >>> BITMASKS.SHAMT_SHIFT;

        /**
         * The function code for the instruction.
         *
         * The ALU will use this to determine the operation to perform.
         *
         * The function code occupies the bits [5:0] of the instruction.
         */
        const funct = (instruction & BITMASKS.FUNCT) >>> BITMASKS.FUNCT_SHIFT;

        /**
         * The immediate value for the instruction.
         *
         * The sign extender will use this to extend the immediate value to 32 bits.
         *
         * The immediate value occupies the bits [15:0] of the instruction.
         */
        const immediate = (instruction & BITMASKS.IMMEDIATE) >>> BITMASKS.IMMEDIATE_SHIFT;

        /**
         * The address for the instruction.
         *
         * The jump unit will use this to set the PC to the new address.
         *
         * The address occupies the bits [25:0] of the instruction.
         */
        const address = (instruction & BITMASKS.ADDRESS) >>> BITMASKS.ADDRESS_SHIFT;

        // Pass the components to the next stage of the pipeline
        this.PCU.setOpcode(opcode);
        this.registerFile.readRegister1 = rs;
        this.writeRegisterMUX.setInputs(rt, rd);
        this.signExtender.setInput(immediate);
        this.ALUControl.setFunctionCode(funct);
    }

    private decodeInstruction() {}

    private executeInstruction() {}

    private memoryAccess() {}

    private writeBack() {}
}

export default SingleCycleMIPSChip;

function numberToBitString(n: number, length: number): number[] {
    return _.padStart(n.toString(2), length, '0').split('').map(Number);
}
