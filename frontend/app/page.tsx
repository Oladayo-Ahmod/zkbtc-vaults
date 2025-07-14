"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CheckCircle, Lock, Wallet, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { zkBTCVaultAbi, erc20Abi, VAULT_ADDRESS, WBTC_ADDRESS } from "@/lib/contract";
import { parseUnits } from "viem/utils";
import GenerateProof from "@/components/GenerateProof";
import MintBadge from "@/components/MintBadge";




export default function Home() {
  const [step, setStep] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [btcAmount, setBtcAmount] = useState(0);
  const [proof, setProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<string[]>([]);

  const steps = [
    {
      title: "Deposit BTC",
      description: "Deposit wrapped BTC into the zkVault.",
      icon: <Wallet className="w-8 h-8 text-orange-500" />,
      action: () => setStep(1),
    },
    {
      title: "Generate ZK Proof",
      description: "Privately prove ownership and unlock the vault.",
      icon: <Lock className="w-8 h-8 text-purple-500" />,
      action: () => setStep(2),
    },
    {
      title: "Receive NFT Badge",
      description: "Earn a soulbound zkBTC badge for unlocking.",
      icon: <BadgeCheck className="w-8 h-8 text-blue-500" />,
      action: () => setStep(0),
    },
  ];

  const { address } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  async function handleDeposit() {
    try {
      const amount = parseUnits(btcAmount.toString(), 18); // wBTC is 18 decimals on Citrea

      // Step 1: Approve Vault
      await writeContractAsync({
        address: WBTC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [VAULT_ADDRESS, amount],
      });

      // Step 2: Deposit to Vault
      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: zkBTCVaultAbi,
        functionName: "deposit",
        args: [amount],
      });

      toast.success("Deposit successful!");
      setShowDeposit(false);
      setStep(1);
    } catch (err) {
      console.error(err);
      toast.error("Deposit failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white p-6">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 bg-clip-text text-transparent"
        >
          zkBTCVault
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-zinc-300 max-w-2xl mx-auto"
        >
          Privately prove ownership of BTC using zero-knowledge proofs and earn a soulbound NFT badge.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6 pt-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className={`bg-zinc-900/50 border border-zinc-700 shadow-xl hover:shadow-orange-500/20 transition-all ${step === i && "ring-2 ring-orange-500"}`}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  {s.icon}
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="text-sm text-zinc-400">{s.description}</p>
                  <Button onClick={s.action} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:brightness-110">
                    {step === i ? "Continue" : "Start"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {step === 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Deposit BTC</h2>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowDeposit(true)}>
              Open Deposit Modal
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Generate ZK Proof</h2>
            <GenerateProof
              onComplete={(genProof, signals) => {
                setProof(genProof);
                setPublicSignals(signals);
                setStep(2); // proceed to next step
              }}
            />
          </div>
        )}

        {step === 2 && proof && publicSignals && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Unlock Vault & Receive NFT</h2>
            <MintBadge
              proof={proof}
              publicSignals={publicSignals}
              onSuccess={() => {
                toast.success("Mint complete!");
              }}
            />
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setStep(0)}
                className="text-sm text-zinc-300 hover:text-white"
              >
                🔁 Start Over
              </Button>
            </div>
          </div>
        )}


      </div>

      <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
        <DialogContent className="bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Deposit Wrapped BTC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <label className="block text-sm text-zinc-400">Amount (wBTC)</label>
            <Input
              type="number"
              className="bg-zinc-800 border border-zinc-700 text-white"
              placeholder="e.g. 0.05"
              value={btcAmount}
              onChange={(e) => setBtcAmount(parseFloat(e.target.value))}
            />
            <Button
              disabled={isConfirming}
              onClick={handleDeposit}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:brightness-110 text-white"
            >
              {isConfirming ? "Processing..." : "Confirm Deposit"}
            </Button>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
