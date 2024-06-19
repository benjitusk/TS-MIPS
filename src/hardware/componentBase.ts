import { Connector } from './connector';

/**
 * Abstract base class to represent a component in a digital circuit.
 */
export abstract class Component {
    private static _instances: Component[] = [];

    static doSingleClockCycle() {
        // Update all components until no more changes are detected
        let hasChanged = true;
        let i = 1;
        while (hasChanged) {
            console.log('Performing clock cycle, iteration ', i++);
            hasChanged = false;
            for (const instance of Component._instances) {
                hasChanged = instance.update() || hasChanged;
            }
        }
    }

    constructor() {
        Component._instances.push(this);
    }

    /**
     * Implement the operation of each component.
     * Returns true if the component's output has changed.
     */
    protected abstract update(): boolean;
}

/**
 * Base class for components with a single output.
 */
export abstract class SingleOutputComponent<const TSize extends number> extends Component {
    public readonly output: Connector<TSize>;

    constructor(size: TSize) {
        super();
        this.output = new Connector(size);
    }

    protected update(): boolean {
        // @ts-ignore
        // console.log(`Updating ${this.constructor.name}, input: ${this.input?.getValue()}, input1: ${this.input1?.getValue()}, input2: ${this.input2?.getValue()}`);
        const oldValue = this.output.getValue();
        this._update();
        console.log(`Updated ${this.constructor.name}, before: ${oldValue}, after: ${this.output.getValue()}`);
        return this.output.getValue() !== oldValue;
    }

    /** Hook for components to implement their update function */
    protected abstract _update(): void;
}

/**
 * Base class for components with a dual output.
 */
export abstract class DualOutputComponent<const TSize1 extends number, const TSize2 extends number> extends Component {
    public readonly output1: Connector<TSize1>;
    public readonly output2: Connector<TSize2>;

    constructor(size1: TSize1, size2: TSize2) {
        super();
        this.output1 = new Connector(size1);
        this.output2 = new Connector(size2);
    }

    protected update(): boolean {
        // @ts-ignore
        // console.log(`Updating ${this.constructor.name}, input: ${this.input?.getValue()}, input1: ${this.input1?.getValue()}, input2: ${this.input2?.getValue()}`);
        const oldValue1 = this.output1.getValue();
        const oldValue2 = this.output2.getValue();
        this._update();
        console.log(
            `Updated ${
                this.constructor.name
            }, before: (${oldValue1}, ${oldValue2}), after: (${this.output1.getValue()}, ${this.output2.getValue()})`
        );
        return this.output1.getValue() !== oldValue1 || this.output2.getValue() !== oldValue2;
    }

    /** Hook for components to implement their update function */
    protected abstract _update(): void;
}
