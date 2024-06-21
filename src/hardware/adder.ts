import { DualOutputComponent } from './componentBase';
import { Connector } from './connector';

/**
 * Adder component with two inputs and two outputs.
 * Output 1 is the sum of the inputs, output 2 is the carry.
 */
export class Adder<const TSize extends number> extends DualOutputComponent<TSize, 1> {
    input1: Connector<TSize>;
    input2: Connector<TSize>;

    constructor(size: TSize) {
        super(size, 1);
        this.input1 = new Connector(size);
        this.input2 = new Connector(size);
    }

    _update() {
        const sum = this.input1.getValue() + this.input2.getValue();
        this.output1.setValue(sum); // wire truncates the value to the correct size
        this.output2.setValue(sum >> this.output1.size);
    }
}
