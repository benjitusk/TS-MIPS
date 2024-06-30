import { SingleOutputComponent } from './componentBase';
import { Connector } from './connector';

export class AndGate<const TSize extends number> extends SingleOutputComponent<TSize> {
    public readonly input1: Connector<TSize>;
    public readonly input2: Connector<TSize>;

    constructor(size: TSize) {
        super(size);
        this.input1 = new Connector(size);
        this.input2 = new Connector(size);
    }

    protected _update() {
        this.output.setValue(this.input1.getValue() & this.input2.getValue());
    }
}

export class OrGate<const TSize extends number> extends SingleOutputComponent<TSize> {
    public readonly input1: Connector<TSize>;
    public readonly input2: Connector<TSize>;

    constructor(size: TSize) {
        super(size);
        this.input1 = new Connector(size);
        this.input2 = new Connector(size);
    }

    protected _update() {
        this.output.setValue(this.input1.getValue() | this.input2.getValue());
    }
}

export class NotGate<const TSize extends number> extends SingleOutputComponent<TSize> {
    public readonly input: Connector<TSize>;

    constructor(size: TSize) {
        super(size);
        this.input = new Connector(size);
    }

    protected _update() {
        this.output.setValue(~this.input.getValue());
    }
}

/**
 * Zero-extends the input to the output size.
 * Can be used to connect components with different input and output sizes.
 * Can also be used to truncate the input to a smaller size (preserving the least significant bits).
 */
export class ZeroExtender<
    const TSizeIn extends number,
    const TSizeOut extends number
> extends SingleOutputComponent<TSizeOut> {
    public readonly input: Connector<TSizeIn>;

    constructor(sizeIn: TSizeIn, sizeOut: TSizeOut) {
        super(sizeOut);
        this.input = new Connector(sizeIn);
    }

    protected _update() {
        this.output.setValue(this.input.getValue());
    }
}
