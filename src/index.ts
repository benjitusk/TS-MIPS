import SingleCycleMIPSChip from './SCMIPSChip';

// This MIPS program calculates the sum of the first 10 positive integers
const program = `
    addi $t0, $zero, 0;     Initialize the sum to 0
    addi $t1, $zero, 1;     Initialize the counter to 1
    addi $t2, $zero, 10;    Set the limit to 10
loop:
    add $t0, $t0, $t1;      Add the counter to the sum
    addi $t1, $t1, 1;       Increment the counter
    bne $t1, $t2, loop;     Repeat if the counter is less than the limit
`;

const mipsChip = new SingleCycleMIPSChip();
mipsChip.run(program);
