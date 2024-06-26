import { Connector, SingleOutputComponent } from '../hardware';

export class MemoryFile extends SingleOutputComponent<32> {
    constructor() {
        super(32);
    }

    public readonly address = new Connector(32);
    public readonly writeData = new Connector(32);

    public readonly memReadControl = new Connector(1);
    public readonly memWriteControl = new Connector(1);

    protected _update(): void {
        throw new Error('Method not implemented.');
    }
}
