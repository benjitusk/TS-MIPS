import SingleCycleMIPSChip from './SCMIPSChip';

const program = `
# MIPS program to calculate the sum of two integers

.data
    # Data section
    integer1: .word 10     # First integer (stored at memory address 0x10010000)
    integer2: .word 20     # Second integer (stored at memory address 0x10010004)
    sum: .word 0           # Variable to store the sum (initialized to 0)

.text
    # Text section (instructions start here)
    main:
        # Load integer1 into $t0
        lw $t0, integer1     # $t0 = integer1

        # Load integer2 into $t1
        lw $t1, integer2     # $t1 = integer2

        # Add $t0 and $t1, store result in $t2
        add $t2, $t0, $t1    # $t2 = $t0 + $t1

        # Store the result in sum
        sw $t2, sum          # sum = $t2

        # End of program
        nop                   # No operation (optional)
`;

const mipsChip = new SingleCycleMIPSChip();
mipsChip.run(program);
