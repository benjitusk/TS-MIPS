import SingleCycleMIPSChip from './SCMIPSChip';

// This MIPS program calculates the sum of the first 10 positive integers
const program = `
main:          lw $t0, top($0)                  ;0x00
               .word beyond                     ;0x04
               jr $1                            ;0x08
               .word 2                          ;0x0c
               ; Hello, I'm a comment;
               add $3, $0, $0                   ;0x10
top: begin: ; Two labels on the same line;
               add $3, $3, $2                   ;0x14
               sub $2, $2, $1                   ;0x18
               bne $2, $0, top ; Go to top      ;0x1c
               jr $31                           ;0x20
beyond: ; Label after last instruction;
`;

const mipsChip = new SingleCycleMIPSChip();
mipsChip.run(program);
