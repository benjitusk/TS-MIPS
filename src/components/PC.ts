import { Connector, SingleOutputComponent } from '../hardware';
import { Memory } from './memory';

export class PC extends SingleOutputComponent<32> {
    private memory: Memory;
    public readonly input = new Connector(32);

    // TODO: We might need a clock input here
    // TODO: because the PC should only change
    // TODO: once per clock cycle

    constructor(memory: Memory) {
        super(32);
        this.memory = memory;
    }
    protected _update(): void {
        throw new Error('Method not implemented.');
    }
}
