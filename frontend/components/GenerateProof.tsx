"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getWitnessCalculator } from "@/app/utils/witnessCalculator";

let snarkjs: any;
if (typeof window !== "undefined") {
  snarkjs = require("snarkjs");
}

export default function GenerateProof({ onComplete }: { onComplete: () => void }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!secret) return toast.error("Please enter your secret");
    setLoading(true);
    try {
      // Step 1: Get witness calculator
      const wc = await getWitnessCalculator("/zk/circuit.wasm");

      // Step 2: Create input object matching circuit
      const input = { x: secret };

      // Step 3: Generate witness binary
      const witnessBuffer = await wc.calculateWTNSBin(input, 0);

      // Step 4: Generate proof from witness and zkey
      const { proof, publicSignals } = await snarkjs.groth16.prove("/zk/circuit_final.zkey", witnessBuffer);

      // Step 5: Verify using vkey
      const vkey = await fetch("/zk/verification_key.json").then((res) => res.json());
      const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

      if (!verified) throw new Error("Invalid proof");

      toast.success("Proof verified successfully");
      onComplete();
    } catch (err: any) {
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
