"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
      const calldata = [
        [proof.pi_a[0], proof.pi_a[1]],
        [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        [proof.pi_c[0], proof.pi_c[1]],
        publicSignals,
      ];

      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: zkVaultAbi,
        functionName: "mintWithProof",
        args: calldata,
      });

      toast.success("Soulbound badge minted!");
    } catch (err: any) {
      toast.error(err.message || "Mint failed");
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
