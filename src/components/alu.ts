import { Connector, DualOutputComponent } from '../hardware';

export class ALU extends DualOutputComponent<32, 1> {
    public readonly inputA = new Connector(32);
    public readonly inputB = new Connector(32);

    /** The arithmatic output of the ALU */
    public readonly output1: Connector<32>;
    /** The Zero flag of the ALU */
    public readonly output2: Connector<1>;

    public readonly operation = new Connector(4);
    constructor() {
        super(32, 1);
    }
    protected _update(): void {
        throw new Error('Method not implemented.');
    }
}
