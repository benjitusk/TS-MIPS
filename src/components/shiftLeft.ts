import { Connector, SingleOutputComponent } from '../hardware';

export class ShiftLeft<Tsize extends number> extends SingleOutputComponent<Tsize> {
    public readonly input: Connector<Tsize>;
    private shamt: number;

    constructor(size: Tsize, shamt: number) {
        super(size);
        this.input = new Connector(size);
        this.shamt = shamt;
    }
    protected _update(): void {
        this.output.setValue(this.input.getValue() << this.shamt);
    }
}
