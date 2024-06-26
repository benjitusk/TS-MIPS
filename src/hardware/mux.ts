import { SingleOutputComponent } from './componentBase';
import { Connector } from './connector';

export class MUX<const Tsize extends number> extends SingleOutputComponent<Tsize> {
    public readonly inputA: Connector<Tsize>;
    public readonly inputB: Connector<Tsize>;

    public readonly control = new Connector(1);

    constructor(size: Tsize) {
        super(size);
        this.inputA = new Connector(size);
        this.inputB = new Connector(size);
    }
    protected _update(): void {
        this.output.setValue(this.control.getValue() === 0 ? this.inputA.getValue() : this.inputB.getValue());
    }
}
