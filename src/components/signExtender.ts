export class SignExtender16To32 {
    /**
     * The input to the sign extender. (16-bit)
     */
    private input: number = 0;

    /**
     * Set the input to the sign extender.
     *
     * @param input The input to the sign extender
     * @note The input is a 16-bit number. Any number greater than 16 bits will be truncated.
     */
    public setInput(input: number) {
        this.input = input & 0xffff;
    }

    /**
     * Get the output of the sign extender. (32-bit)
     */
    public getOutput(): number {
        // If the sign bit is 0, return the input
        if ((this.input & 0x8000) === 0) {
            return this.input;
        }

        // Otherwise, sign extend the input
        return this.input | 0xffff0000;
    }
}
