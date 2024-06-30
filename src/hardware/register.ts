import { SingleOutputComponent } from './componentBase';
import { Connector } from './connector';

export class Register<const TSize extends number> extends SingleOutputComponent<TSize> {
    public readonly input: Connector<TSize>;
    /** value to be applied on NEXT clock tick */
    private value: number;

    constructor(size: TSize, value?: number) {
        super(size);
        this.input = new Connector(size);
        this.value = typeof value === 'number' ? value : Math.floor(Math.random() * 2 ** size); // initialize with random value
    }

    protected _update(): void {
        // set incoming value
        this.value = this.input.getValue();
        // output does not change here!
    }

    protected onTick(): void {
        this.output.setValue(this.value);
    }
}
