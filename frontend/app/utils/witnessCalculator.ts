export async function getWitnessCalculator(wasmPath: string) {
  // Import the witness calculator directly
  const wcModule = await import("../../public/zk/witness_calculator.js");
  
  // Load wasm
  const wasmBuffer = await fetch(wasmPath).then((res) => res.arrayBuffer());

  // Build witness calculator from wasm
  const wc = await wcModule.default(wasmBuffer);
  return wc;
}