'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 backdrop-blur bg-zinc-900/70 border-b border-zinc-800 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          zkBTCVault
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-300 hover:text-white transition">Home</Link>
          <Link href="/vault" className="text-sm text-zinc-300 hover:text-white transition">Vault</Link>
          <Link href="/badge" className="text-sm text-zinc-300 hover:text-white transition">Badge</Link>
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:brightness-110">Connect Wallet</Button>
        </div>
      </div>
    </motion.nav>
  );
}
