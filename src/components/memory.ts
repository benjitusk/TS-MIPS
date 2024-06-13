/// Author: Benji Tusk
/// Description: MEMORY component for a MIPS processor

export class Memory {
    /** The amount of bytes allocated for a single instance of Memory */
    private MEMORY_SIZE: number;

    /**
     * The memory of the MIPS processor,
     * represented as a Uint8Array of size MEMORY_SIZE.
     *
     * We chose a Uint8Array because it is a typed array that
     * can only store unsigned 8-bit integers, which is the
     * smallest unit of memory in the MIPS processor.
     */
    private memory: Uint8Array;

    constructor(memorySize: number) {
        this.MEMORY_SIZE = memorySize;
        this.memory = Uint8Array.from({ length: this.MEMORY_SIZE });
    }

    /**
     * A simple utility to validate a read/write address
     */
    private validateAddress(address: number, length: number = 0) {
        if (address < 0 || address + length > this.MEMORY_SIZE)
            throw new Error(`Memory address out of bounds: ${address}`);
    }

    /**
     * The listeners that are notified when the memory is written to.
     * The key is the address being listened to, and the value is an array of listeners.
     */
    private listeners: Map<number, Function[]> = new Map();

    /**
     * Adds a listener to the memory.
     *
     * @param address The address to listen to
     * @param listener The listener to notify
     */
    public addListener(address: number, listener: Function): void {
        if (!this.listeners.has(address)) this.listeners.set(address, []);
        this.listeners.get(address)?.push(listener);
    }

    /**
     * Notifies the listeners that the memory was written to.
     *
     * @param address The address that was written to
     * @param length The number of bytes written
     * @param data The data that was written
     */
    private notifyListeners(address: number, data: Uint8Array): void {
        // Notify the listeners at the given address
        if (this.listeners.has(address)) for (const listener of this.listeners.get(address) ?? []) listener(data);
    }

    public readByte(address: number) {
        const view = new DataView(this.memory.buffer);
        return view.getUint8(address);
    }

    public readWord(address: number) {
        // TODO: Make sure we're reading on a word boundary
        const view = new DataView(this.memory.buffer);
        return view.getUint32(address, false);
    }
    /**
     * Writes bytes to the memory at the given address.
     *
     * @param address The address to write to
     * @param data The data to write
     */
    public write(address: number, data: Uint8Array): void {
        // Check if the address is within the bounds of the memory
        this.validateAddress(address, data.byteLength);

        // Write the data to the memory
        const view = new DataView(this.memory.buffer);
        for (let i = 0; i < data.byteLength; i++) view.setUint8(address + i, data[i]);

        // Notify the memory listeners
        this.notifyListeners(address, data);
    }

    /**
     * Clears the memory of the MIPS processor.
     */
    public clear(): void {
        this.memory.fill(0);
        // Clear the listeners
        this.listeners.clear();
    }

    /**
     * Prints the contents of memory to the console.
     */
    public dump(): void {
        throw new Error('Not implemented.');
    }
}
