/**
 * This class can take a n-bit input and split it into n wires.
 */

import { Component } from './componentBase';
import { Connector } from './connector';

/**
 * InstructionSplitter can take a 32 bit instruction and split it into
 * the opcode, rs, rt, rd, shamt, funct, imm, and address fields.
 */
export class InstructionSplitter extends Component {
    public readonly input: Connector<32>;
    public readonly outputs: {
        opCode: Connector<6>;
        rs: Connector<5>;
        rt: Connector<5>;
        rd: Connector<5>;
        shamt: Connector<5>;
        funct: Connector<6>;
        imm: Connector<16>;
        address: Connector<26>;
    };

    constructor() {
        super();
        this.input = new Connector(32);
        this.outputs = {
            opCode: new Connector(6),
            rs: new Connector(5),
            rt: new Connector(5),
            rd: new Connector(5),
            shamt: new Connector(5),
            funct: new Connector(6),
            imm: new Connector(16),
            address: new Connector(26),
        };
    }

    protected update(): boolean {
        let oldValues = Object.values(this.outputs).map((output) => output.getValue());
        this._update();
        let newValues = Object.values(this.outputs).map((output) => output.getValue());

        for (let i = 0; i < oldValues.length; i++) {
            // If any of the old values don't equal the new values
            // return true immediately
            if (oldValues[i] !== newValues[i]) return true;
        }

        // All the values are the same, no update was performed.
        return false;
    }

    protected _update(): void {
        const value = this.input.getValue();
        const opCode = (value >> 26) & 0b111111; // 6 bit mask
        const rs = (value >> 21) & 0b11111; // 5 bit mask
        const rt = (value >> 16) & 0b11111; // 5 bit mask
        const rd = (value >> 11) & 0b11111; // 5 bit mask
        const shamt = (value >> 6) & 0b11111; // 5 bit mask
        const funct = value & 0b111111; // 6 bit mask
        const imm = value & 0xffff; // 16 bit mask
        const address = value & 0x3ffffff; // 26 bit mask

        this.outputs.opCode.setValue(opCode);
        this.outputs.rs.setValue(rs);
        this.outputs.rt.setValue(rt);
        this.outputs.rd.setValue(rd);
        this.outputs.shamt.setValue(shamt);
        this.outputs.funct.setValue(funct);
        this.outputs.imm.setValue(imm);
        this.outputs.address.setValue(address);

        // console.log(`Updated ${this.constructor.name}, input: ${value}, opCode: ${opCode}, rs: ${rs}, rt: ${rt}, rd: ${rd}, shamt: ${shamt}, funct: ${funct}, imm: ${imm}, address: ${address}`);
    }
}
