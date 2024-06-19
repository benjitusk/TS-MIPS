/**
 * Represents a wire with a fixed size (in bits).
 */
export class Wire<const TSize extends number> {
    private value: number = 0;
    public readonly size: TSize;

    public constructor(size: TSize, value?: number) {
        this.size = size;
        this.value = typeof value === 'number' ? value : Math.floor(Math.random() * 2 ** size); // initialize with random value
    }

    public setValue(value: number) {
        const mask = 2 ** this.size - 1;
        this.value = value & mask;
    }

    public getValue(): number {
        return this.value;
    }
}

/**
 * The inputs and outputs of a component are connectors that can be connected to wires or static values.
 */
export class Connector<const TSize extends number> {
    private value?: number;
    private wire?: Wire<TSize>;
    public readonly size: TSize;

    public constructor(size: TSize, connectee?: number | Wire<TSize>) {
        this.size = size;
        if (connectee) {
            this.connect(connectee);
        }
    }

    public connect(connectee: number | Wire<TSize>) {
        if (typeof connectee === 'number') {
            this.value = connectee;
            if (this.wire)
                // if this connector already has a wire, update the wire value
                this.wire.setValue(connectee);
        } else if (connectee instanceof Wire) {
            this.wire = connectee;
            if (connectee.size !== this.size) {
                throw new Error('Connector size must match wire size');
            }
        }
    }

    public getValue(): number {
        if (typeof this.value === 'number') {
            return this.value;
        } else if (this.wire) {
            return this.wire.getValue();
        } else {
            throw new Error('Invalid value');
        }
    }

    public setValue(value: number) {
        if (this.wire) {
            this.wire.setValue(value);
        } else {
            console.warn('Setting value of a non-wire connector');
        }
    }

    /**
     * Connect two component connectors together, with a wire or to a static value.
     * @param flowFrom The connector or static value to flow from.
     * @param flowTo The connector to flow to.
     */
    public static connect<const TSize extends number>(flowFrom: Connector<TSize> | number, flowTo: Connector<TSize>) {
        // console.log('Connecting', flowFrom, 'to', flowTo)
        if (flowFrom instanceof Connector) {
            if (flowFrom.size !== flowTo.size) {
                throw new Error('Connector sizes must match');
            }
            // If flowFrom is a connector with an existing wire, cut the middleman and connect flowTo directly to the incoming wire
            if (flowFrom.wire) {
                flowTo.connect(flowFrom.wire);
            } else if (flowTo.wire) {
                flowFrom.connect(flowTo.wire);
            } else {
                // Create a new wire to connect the two connectors
                const wire = new Wire(flowFrom.size);
                flowFrom.connect(wire);
                flowTo.connect(wire);
            }
        } else if (typeof flowFrom === 'number') {
            flowTo.connect(flowFrom);
        } else {
            throw new Error('Invalid flow from');
        }
    }
}
