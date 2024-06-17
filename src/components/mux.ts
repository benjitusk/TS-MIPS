import { bit } from '../types';

export class MUX {
    /**
     * The first input to the MUX.
     */
    private input1: number = 0;

    /**
     * The second input to the MUX.
     */
    private input2: number = 0;

    /**
     * The control signal for the MUX.
     */
    private control: bit = 0;

    /**
     * Set the inputs to the MUX.
     */
    public setInputs(in1: number, in2: number) {
        this.input1 = in1;
        this.input2 = in2;
    }

    /**
     * Set the control signal for the MUX.
     */
    public setControl(control: bit) {
        // The control signal is a single bit
        this.control = (control & 0x1) as 0 | 1;
    }

    /**
     * Get the output of the MUX.
     */
    public getOutput(): number {
        return this.control === 0 ? this.input1 : this.input2;
    }
}
