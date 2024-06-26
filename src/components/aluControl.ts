import { Connector, SingleOutputComponent } from '../hardware';

/**
 * The ALU control determines the operation that will be performed
 * by the ALU, based on the function code input and the ALUOp control line.
 *
 * The function code is a 4-bit number. See {@link https://www.cs.ucr.edu/~windhs/lab4/lab4.html|this website}
 * for more information on the inputs and outputs of this component.
 */
export class ALUControl extends SingleOutputComponent<4> {
    public readonly functInput = new Connector(6);
    public readonly ALUOpControl = new Connector(2);

    constructor() {
        super(4);
    }
    protected _update(): void {
        throw new Error('Method not implemented.');
    }
}
