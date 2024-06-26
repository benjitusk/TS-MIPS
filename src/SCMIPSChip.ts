import _ from 'lodash';
import { Assembler } from './assembler/assembler';
import { Memory as InternalMemory } from './components/memory';
import { PCU } from './components/PCU';
import { RegisterFile } from './components/RegisterFile';
import { Adder, AndGate, Component, Connector, ZeroExtender } from './hardware';
import { InstructionSplitter } from './hardware/instructionSplitter';
import { MUX } from './hardware/mux';
import { ALUControl } from './components/aluControl';
import { ALU } from './components/alu';
import { InstructionMemory } from './components/instructionMemory';
import { MemoryFile } from './components/memoryFile';
import { PC } from './components/PC';
import { ShiftLeft } from './components/shiftLeft';

class SingleCycleMIPSChip {
    // MARK: - Chip Config

    /** The size of the processor memory in bytes */
    private readonly MIPS_MEMORY_SIZE = 33554432; // 32 MiB

    /** The speed of the internal processor clock */
    private readonly CLOCK_SPEED = 1; // 1 kHz

    /** Processor Memory */
    private readonly memory = new InternalMemory(this.MIPS_MEMORY_SIZE);

    // MARK: - Internal Hardware

    /** Instruction Memory */
    private readonly instructionMemory = new InstructionMemory(this.memory);
    private readonly instructionSplitter = new InstructionSplitter();

    /** Processor Control Unit */
    private readonly PCU = new PCU();

    /** Processor Registers */
    private readonly registerFile = new RegisterFile();
    private readonly regFileWriteRegMux = new MUX(5);
    private readonly regFileWriteDataMux = new MUX(32);

    /** 16 to 32 bit sign extender */
    private readonly signExtender = new ZeroExtender(16, 32);

    /** ALU Control Unit */
    private readonly ALUControl = new ALUControl();

    /** Arithmetic and Logic Unit */
    private readonly ALU = new ALU();
    private readonly ALUInput2Mux = new MUX(32);

    /** Processor Memory File */
    private readonly memoryFile = new MemoryFile();

    /** Program Counter */
    private readonly PC = new PC(this.memory);
    private readonly PCAdder = new Adder();

    /** Branch Computation */
    private readonly SLL2 = new ShiftLeft(32, 2);
    private readonly branchAdder = new Adder();
    private readonly branchMux = new MUX(32);

    // MARK: - Connections
    constructor() {
        // Input for the PC comes from the Branch Mux
        Connector.connect(this.branchMux.output, this.PC.input);
        // Input for the instruction memory comes from the PC
        Connector.connect(this.PC.output, this.instructionMemory.addressInput);

        // Input for the instruction splitter comes from the instruction memory
        Connector.connect(this.instructionMemory.output, this.instructionSplitter.input);

        // Input for the Register File Read Registers comes from RS and RT
        Connector.connect(this.instructionSplitter.outputs.rs, this.registerFile.readRegisterOne);
        Connector.connect(this.instructionSplitter.outputs.rt, this.registerFile.readRegisterTwo);

        // Input for the Register File Write Register comes from the WriteRegister Mux
        Connector.connect(this.regFileWriteRegMux.output, this.registerFile.writeRegister);

        // Input for the Register File Write Data comes from the WriteData Mux
        Connector.connect(this.regFileWriteDataMux.output, this.registerFile.writeData);

        // Input for the Register File Reg Write Control comes from the PCU
        Connector.connect(this.PCU.regWrite, this.registerFile.regWrite);

        // Input from the mux comes from RT/RD and regDest Control Line
        Connector.connect(this.instructionSplitter.outputs.rt, this.regFileWriteRegMux.inputA);
        Connector.connect(this.instructionSplitter.outputs.rd, this.regFileWriteRegMux.inputB);
        Connector.connect(this.PCU.regDst, this.regFileWriteRegMux.control);

        // Input for the PCU comes from the opcode of the instruction
        Connector.connect(this.instructionSplitter.outputs.opCode, this.PCU.input);

        // Input for the ALUControl comes from the funct field of the instruction
        Connector.connect(this.instructionSplitter.outputs.funct, this.ALUControl.functInput);

        // Input for the SignExtender comes from the imm field of the instruction
        Connector.connect(this.instructionSplitter.outputs.imm, this.signExtender.input);

        // Data inputs for the ALU come from the Register File and the ALU Input Mux
        Connector.connect(this.registerFile.output1, this.ALU.inputA);
        Connector.connect(this.ALUInput2Mux.output, this.ALU.inputB);
        // Control input for the ALU comes from the ALUControl
        Connector.connect(this.ALUControl.output, this.ALU.operation);
        // Input for the ALU Input Mux comes from the Register File and the SignExtender
        Connector.connect(this.registerFile.output2, this.ALUInput2Mux.inputA);
        Connector.connect(this.signExtender.output, this.ALUInput2Mux.inputB);
        Connector.connect(this.PCU.aluSRC, this.ALUInput2Mux.control);

        // Address input for the Memory File comes from the ALU output
        Connector.connect(this.ALU.output1, this.memoryFile.address);
        // Write data input for the Memory File comes from the Register File (Read Data 2)
        Connector.connect(this.registerFile.output2, this.memoryFile.writeData);
        // Control input for the Memory File comes from the PCU
        Connector.connect(this.PCU.memWrite, this.memoryFile.memWriteControl);
        Connector.connect(this.PCU.memRead, this.memoryFile.memReadControl);

        // Input for the Register File Write Data Mux comes from the ALU output and the Memory File Read Data
        Connector.connect(this.ALU.output1, this.regFileWriteDataMux.inputA);
        Connector.connect(this.memoryFile.output, this.regFileWriteDataMux.inputB);
        // Control input for the Register File Write Data Mux comes from the MemToReg Control Line
        Connector.connect(this.PCU.memToReg, this.regFileWriteDataMux.control);

        // Input for the SLL2 comes from the SignExtender
        Connector.connect(this.signExtender.output, this.SLL2.input);

        // Input for the Branch Adder comes from the PC Adder and the SLL2
        Connector.connect(this.PCAdder.output, this.branchAdder.input1);
        Connector.connect(this.SLL2.output, this.branchAdder.input2);

        // Input for the Branch Mux comes from the Branch Adder and the PC Adder
        Connector.connect(this.branchAdder.output, this.branchMux.inputA);
        Connector.connect(this.branchAdder.output, this.branchMux.inputB);
        // Control for the Branch Mux comes from (ALU.Zero and Branch Control Line)
        const AND = new AndGate(32); // 32 bit AND gate
        Connector.connect(this.PCU.branch, AND.input1);
        Connector.connect(this.ALU.output2, AND.input2); // ALU.Zero
        Connector.connect(AND.output, this.branchMux.control);

        // Input for the PC Adder comes from the PC and the literal (4)
        Connector.connect(this.PC.output, this.PCAdder.input1);
        Connector.connect(4, this.PCAdder.input2);
    }

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
        Component.doSingleClockCycle();
    }
}

export default SingleCycleMIPSChip;
