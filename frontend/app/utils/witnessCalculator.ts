export async function getWitnessCalculator(wasmPath: string) {
  const wcJs = await fetch("/zk/witness_calculator.js").then((res) => res.text());

  // Create a Blob and import it dynamically
  const blob = new Blob([wcJs], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  const wcModule = await import(/* @vite-ignore */ blobUrl);

  // Load wasm
  const wasmBuffer = await fetch(wasmPath).then((res) => res.arrayBuffer());

  // Build witness calculator from wasm
  const wc = await wcModule.default(wasmBuffer);
  return wc;
}
