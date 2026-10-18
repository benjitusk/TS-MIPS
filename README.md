# TS-MIPS

A MIPS assembler and single-cycle MIPS processor simulator, written from scratch in TypeScript.

TS-MIPS takes MIPS assembly source and turns it into 32-bit machine code with a two-pass assembler. It then loads that code into a simulated memory, where a model of the classic single-cycle MIPS datapath (PC, register file, ALU, control unit, muxes, and the wires between them) is built to execute it.

> **Status:** work in progress. The assembler is the most complete part. The datapath is fully modeled and wired, but the control logic that would make it execute programs end to end is not finished yet. See [Status](#status).

## Features

### Assembler

- **Two-pass assembly.** Pass one validates every line and builds the symbol table. Pass two finalizes label offsets, runs the assembler directives, resolves labels and register aliases, and expands pseudo-instructions.
- **Instruction set:** about 47 core MIPS instructions (R-, I-, and J-type: arithmetic, logical, shifts, loads/stores, branches, jumps), plus `syscall`, `break`, and `eret`.
- **Pseudo-instructions,** expanded to real instructions: `li`, `la`, `move`, `abs`, `neg`, `negu`, `not`, `blt`, `bgt`, `ble`, `bge`, `beqz`, `sge`, `sgt`.
- **Assembler directives:** `.text`, `.data`, `.word`, `.half`, `.byte`, `.ascii`, `.asciiz`, `.space`, `.align`, `.float`, `.double`.
- **Segments:** separate `.text` and `.data` segments, each with its own location counter.
- **Register aliases** (`$t0`, `$sp`, `$zero`, ...) as well as numeric registers (`$8`).
- **Syntax handled:** labels on their own line or inline (`loop: add ...`), `#` and `;` comments, character literals, and `offset($base)` memory operands.
- **A tokenizer** that parses each instruction into a typed operand list (register, immediate, or memory reference).
- **Typed errors** for syntax errors, unknown labels, and unknown registers, each reported with its line number.

### Hardware model

The processor is modeled as discrete components connected by fixed-width wires, following the textbook single-cycle MIPS datapath:

- **Primitives** (`src/hardware/`): `Wire` and `Connector` (fixed bit width, with masked values), logic gates, adders, multiplexers, a zero/sign extender, clocked registers, and an instruction splitter that breaks a 32-bit word into its `opcode`, `rs`, `rt`, `rd`, `shamt`, `funct`, and `imm` fields.
- **Datapath components** (`src/components/`): program counter, instruction memory, register file, ALU, ALU control, program control unit, data memory, and a shift-left-2 unit for branch targets.
- **Clocking:** every clock tick propagates signals through the circuit until no component's output changes. Then clocked components (registers) latch their new values.
- **Memory:** byte-addressable memory backed by a `Uint8Array`, with bounds checking and write listeners.
- **Type-level widths:** bit widths are TypeScript `const` generics, so the code makes each wire's width explicit when components are connected (`Connector<5>` for a register number, `Connector<32>` for a data word). Mismatched connections are also rejected at runtime.

## Example

Given this program:

```asm
.data
msg:    .asciiz "hi"

.text
        nop
main:   li   $t0, 5
        addi $t1, $zero, 3
loop:   add  $t2, $t0, $t1      # $t2 = $t0 + $t1
        sw   $t2, 0($sp)
        blt  $t0, $t1, loop
        la   $a0, msg
        j    main
```

The assembler expands `li`, `blt`, and `la` into real instructions and encodes the result:

| Address | Machine code | Instruction |
|---------|--------------|-------------|
| `0x00`  | `0x00000000` | `nop` |
| `0x04`  | `0x3c080000` | `lui $t0, 0` *(from `li`)* |
| `0x08`  | `0x35080005` | `ori $t0, $t0, 5` *(from `li`)* |
| `0x0c`  | `0x20090003` | `addi $t1, $zero, 3` |
| `0x10`  | `0x01095020` | `add $t2, $t0, $t1` |
| `0x14`  | `0xafaa0000` | `sw $t2, 0($sp)` |
| `0x18`  | `0x0109082a` | `slt $at, $t0, $t1` *(from `blt`)* |
| `0x1c`  | `0x14200010` | `bne $at, $zero, loop` *(from `blt`)* |
| `0x20`  | `0x3c040000` | `lui $a0, 0` *(from `la`)* |
| `0x24`  | `0x34840800` | `ori $a0, $a0, 0x800` *(from `la`; `msg` is at the start of `.data`)* |
| `0x28`  | `0x08000004` | `j main` |

## Getting started

Requires Node.js.

```bash
git clone https://github.com/benjitusk/TS-MIPS.git
cd TS-MIPS
npm install
```

The quickest way to try the assembler is to run a short script with [`tsx`](https://github.com/privatenumber/tsx):

```ts
// try.ts
import { Assembler } from './src/assembler/assembler';
import { Memory } from './src/components/memory';

const memory = new Memory(4096);
new Assembler(memory).assemble(
    `
    nop
main:   li  $t0, 42
        add $t1, $t0, $t0
        j   main
`,
    0
);
for (let addr = 0; addr < 20; addr += 4) {
    console.log(addr, memory.readWord(addr).toString(16).padStart(8, '0'));
}
```

```bash
npx tsx try.ts
```

`src/index.ts` is the full-chip entry point: it reads `in.asm` from the project root, assembles it, and runs a clock cycle on the simulated processor.

## Project structure

```
src/
├── assembler/
│   ├── assembler.ts         Two-pass assembler: parse, validate, symbol table, resolve, expand, encode
│   └── tokenizer.ts         Instruction → typed operands
├── language/
│   ├── MIPS.ts              Instruction set: opcodes, funct codes, validation, registers and aliases
│   └── ASMDirectives.ts     Assembler directives: validation, sizing, and execution
├── hardware/                Circuit primitives: wires, connectors, gates, adders, muxes, registers
├── components/              Datapath components: PC, register file, ALU, control units, memory
├── SCMIPSChip.ts            Builds and wires the single-cycle datapath
├── utils/Errors.ts          Assembler error types
└── tests/                   Tokenizer and memory tests
```

## Status

What works:

- The assembler parses, validates, and encodes R- and I-type instructions, pseudo-instructions, and data directives.
- The full single-cycle datapath is modeled and wired together in `SCMIPSChip.ts`.

Still to do:

- [ ] Implement the control unit's decode logic (it exposes every control line, but its `update` is still a stub), so the chip can execute programs end to end
- [ ] Encode branch offsets as PC-relative word offsets, and jump targets as word addresses (both currently use absolute byte addresses)
- [ ] Allow labels at address `0x0` (they are currently reported as unknown)
- [ ] Fix the clock-cycle method name mismatch in `SCMIPSChip.ts` and add `@types/node`, so `npm run build` passes
- [ ] Wire the tests into `npm test`

## Contributors

- [Benji Tusk](https://github.com/benjitusk): assembler, language definitions, memory, and datapath
- [@Scimonster](https://github.com/Scimonster): the hardware component framework (wires, connectors, gates, clocked registers)
