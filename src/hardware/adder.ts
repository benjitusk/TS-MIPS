import { SingleOutputComponent } from './componentBase';
import { Connector } from './connector';

/**
 * Adder component with two inputs and two outputs.
 * Output 1 is the sum of the inputs, output 2 is the carry.
 */
export class Adder extends SingleOutputComponent<32> {
    public readonly input1 = new Connector(32);
    public readonly input2 = new Connector(32);

    constructor() {
        super(32);
    }

    protected _update() {
        const sum = this.input1.getValue() + this.input2.getValue();
        this.output.setValue(sum); // wire truncates the value to the correct size
    }
}
