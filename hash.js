const circomlib = require('circomlibjs');

async function main() {
  const poseidon = await circomlib.buildPoseidon();
  const secret = 12345;
  const hash = poseidon.F.toString(poseidon([secret]));

  console.log("Poseidon hash of", secret, "is:\n", hash);
}

main();
