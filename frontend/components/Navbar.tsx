'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Navbar() {
  const { address, isConnected } = useAccount();

  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

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
          
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button 
                          onClick={openConnectModal}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:brightness-110"
                        >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button 
                          onClick={openChainModal}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:brightness-110"
                        >
                          Wrong Network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex gap-2">
                        <Button
                          onClick={openChainModal}
                          variant="outline"
                          className="text-sm text-zinc-200 border-zinc-700 hover:bg-zinc-800"
                        >
                          {chain.name}
                        </Button>
                        
                        <Button
                          onClick={openAccountModal}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:brightness-110"
                        >
                          {account.displayName}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </motion.nav>
  );
}