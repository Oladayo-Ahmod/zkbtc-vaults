"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { getWitnessCalculator } from "@/app/utils/witnessCalculator";
import MintBadge from "./MintBadge";
import { buildPoseidon } from "circomlibjs";

let snarkjs: any;
if (typeof window !== "undefined") {
  snarkjs = require("snarkjs");
}

export default function GenerateProof({ onComplete }: { onComplete: (proof:any, publicSignals:any) => void }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);


async function handleGenerate() {
  if (!secret) return toast.error("Please enter your secret");
  setLoading(true);

  try {
    const secretBigInt = BigInt(secret);
    const poseidon = await buildPoseidon();
    const F = poseidon.F;
    const hash = F.toObject(poseidon([secretBigInt])); // expectedHash

    // Step 1: Get witness calculator
    const wc = await getWitnessCalculator("/circuits/circuit.wasm");

    // Step 2: Prepare full input
    const input = {
      secret: secretBigInt,
      expectedHash: hash,
    };

    // Step 3: Generate witness
    const witnessBuffer = await wc.calculateWTNSBin(input, 0);

    // Step 4: Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      "/circuits/circuit.zkey",
      witnessBuffer
    );

    // Step 5: Verify
    const vkey = await fetch("/zk/verification_key.json").then((res) => res.json());
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    if (!verified) throw new Error("Invalid proof");

    toast.success("Proof verified successfully");
    onComplete(proof, publicSignals);
    console.log(proof,publicSignals)
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="max-w-md mx-auto space-y-4">
      <Input
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Enter secret for proof"
        className="bg-zinc-800 border border-zinc-700 text-white"
      />
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white w-full"
      >
        {loading ? "Generating..." : "Generate Proof"}
      </Button>
    </div>
  );
}
