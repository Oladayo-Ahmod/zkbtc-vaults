"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useAccount, useWriteContract } from "wagmi";
import zkVaultAbi from "@/lib/zkBTCVault.json";

const VAULT_ADDRESS = "0x365eBC29e0ea79cDa7eB9CE26Cc3DeBf7Dbd8180";

export default function MintBadge({
  proof,
  publicSignals,
}: {
  proof: any;
  publicSignals: string[];
}) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

async function handleMint() {
  if (!address) return toast.error("Connect wallet first");
  setLoading(true);
  try {
    const a = [proof.pi_a[0], proof.pi_a[1]];
    const b = [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ];
    const c = [proof.pi_c[0], proof.pi_c[1]];
    const input = [publicSignals[0]];

    await writeContractAsync({
      address: VAULT_ADDRESS,
      abi: zkVaultAbi,
      functionName: "unlockVault",
      args: [a, b, c, input],
    });

    toast.success("Soulbound badge minted!");
  } catch (err: any) {
    console.error("Transaction Error:", err);

    // Extract meaningful revert reason
    if (err?.shortMessage) {
      toast.error(err.shortMessage);
    } else if (err?.cause?.message) {
      toast.error(err.cause.message);
    } else if (err?.message) {
      toast.error(err.message);
    } else {
      toast.error("Transaction failed");
    }
  } finally {
    setLoading(false);
  }
}


  return (
    <Button
      onClick={handleMint}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white w-full"
    >
      {loading ? "Minting..." : "Mint Badge"}
    </Button>
  );
}
