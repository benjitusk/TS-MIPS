import SingleCycleMIPSChip from './SCMIPSChip';
import fs from 'fs';
import path from 'path';

// Read ../in.asm
const program = fs.readFileSync(path.join(__dirname, '../in.asm'), 'utf8');

const mipsChip = new SingleCycleMIPSChip();
mipsChip.run(program);
