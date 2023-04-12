/*
 instruction model:
 mov ax, bx

 ax = destination register
 bx = source register

 first byte
 mov = 100010 <- high six bits
 mov = XX <- bottom two bits [d, w]
 if d = 1, reg field is destintion, otherwise r/m field is destination
 if w = 0, copy 8 bits, else copy 16 bits

 second byte
 XX <- mod field: type of move (in this case always 11; register to register)
 XXX <- reg field
 XXX <- r/m field
*/

const fs = require('fs');

const regTable = {
  '000': ['al', 'ax'],
  '001': ['cl', 'cx'],
  '010': ['dl', 'dx'],
  '011': ['bl', 'bx'],
  100: ['ah', 'sp'],
  101: ['ch', 'bp'],
  110: ['dh', 'si'],
  111: ['bh', 'di'],
};

const hexToBin = (hex) => {
  return hex
    .match(/.{1,2}/g)
    .map((pair) => parseInt(pair, 16).toString(2).padStart(8, '0'));
};

const processFirstByte = (byte) => {
  const instruction = byte.slice(0, 6);
  // in future instruction will have a look up
  const d = byte.charAt(6);
  const w = byte.charAt(7);
  return ['mov', d, w];
};

const processSecondByte = (byte, w) => {
  const reg = byte.slice(2, 5);
  const r_m = byte.slice(5);
  return [regTable[reg][w], regTable[r_m][w]];
};

const decompile = (filePath) => {
  const code = fs.readFileSync(filePath, 'hex');
  const instructions = hexToBin(code);

  if (instructions.length < 2 || instructions.length % 2 === 1) {
    throw Error('Not enough instructions:', instructions);
  }

  let fullInstructionSet = '';

  for (let i = 0; i < instructions.length - 1; i += 2) {
    const firstByte = instructions[i];
    const [instruction, d, w] = processFirstByte(firstByte);

    const secondByte = instructions[i + 1];
    const [reg, r_m] = processSecondByte(secondByte, w);
    if (d === 1) {
      fullInstructionSet += `mov ${reg}, ${r_m}\n`;
    } else {
      fullInstructionSet += `mov ${r_m}, ${reg}\n`;
    }
  }

  console.log(fullInstructionSet);
};

decompile('listing_0037_single_register_mov');
decompile('listing_0038_many_register_mov');
