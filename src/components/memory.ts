/// Author: Benji Tusk
/// Description: MEMORY component for a MIPS processor

class Memory {
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

    /**
     * Reads bytes from the memory at the given address.
     *
     * @param address The address to read from
     * @param length The number of bytes to read, defaults 4 (one word)
     * @returns The byte read from the memory
     */
    private read(address: number, length: number): Uint8Array {
        // Check if the address is within the bounds of the memory
        this.validateAddress(address, length);

        // Read the byte from the memory
        return this.memory.slice(address, address + length);
    }

    public readByte(address: number): Uint8Array {
        return this.read(address, 1);
    }

    public readWord(address: number): Uint32Array {
        // TODO: Make sure we're reading on a word boundary
        return Uint32Array.from(this.read(address, 4));
    }
    /**
     * Writes bytes to the memory at the given address.
     *
     * @param address The address to write to
     * @param data The data to write
     */
    public write(address: number, data: Uint8Array): void {
        // Check if the address is within the bounds of the memory
        this.validateAddress(address, length);

        // Write the data to the memory
        this.memory.set(data, address);

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
}
