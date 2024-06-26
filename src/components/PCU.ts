/**
 * The Program Control Unit
 */

import { Component, Connector } from '../hardware';

export class PCU extends Component {
    public readonly regDst = new Connector(1);
    public readonly branch = new Connector(1);
    public readonly memRead = new Connector(1);
    public readonly memToReg = new Connector(1);
    public readonly aluOP = new Connector(2);
    public readonly memWrite = new Connector(1);
    public readonly aluSRC = new Connector(1);
    public readonly regWrite = new Connector(1);

    private readonly outputs = [
        this.regDst,
        this.branch,
        this.memRead,
        this.memToReg,
        this.aluOP,
        this.memWrite,
        this.aluSRC,
        this.regWrite,
    ];

    public readonly input = new Connector(6);

    constructor() {
        super();
    }

    protected update(): boolean {
        let oldValues = this.outputs.map((output) => output.getValue());
        this._update();
        let newValues = this.outputs.map((output) => output.getValue());

        for (let i = 0; i < oldValues.length; i++) {
            // If any of the old values don't equal the new values
            // return true immediately
            if (oldValues[i] !== newValues[i]) return true;
        }

        // All the values are the same, no update was performed.
        return false;
    }

    protected _update(): void {}
}
