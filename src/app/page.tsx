"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { parseEther } from "viem";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { focusStakeAbi } from "@/lib/focusStakeAbi";

const contractAddress = process.env.NEXT_PUBLIC_FOCUSSTAKE_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, isPending } = useWriteContract();

  const [title, setTitle] = useState("");
  const [stakeEth, setStakeEth] = useState("0.02");
  const [allowSlip, setAllowSlip] = useState(true);
  const [durationDays, setDurationDays] = useState(7);
  const [status, setStatus] = useState("");

  const createCommitment = async () => {
    if (!contractAddress) {
      setStatus("Set NEXT_PUBLIC_FOCUSSTAKE_CONTRACT_ADDRESS in your .env.local");
      return;
    }

    if (!title.trim()) {
      setStatus("Please add a commitment title.");
      return;
    }

    try {
      const deadline = Math.floor(Date.now() / 1000) + durationDays * 24 * 60 * 60;

      const tx = await writeContractAsync({
        abi: focusStakeAbi,
        address: contractAddress,
        functionName: "createCommitment",
        args: [title.trim(), BigInt(deadline), allowSlip],
        value: parseEther(stakeEth || "0"),
      });

      setStatus(`Commitment submitted. Tx: ${tx.slice(0, 10)}...`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed.";
      setStatus(message);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
      <motion.section
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">FocusStake</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Stake ETH on personal commitments. Success unlocks recovery, and slips
          pause progress with compassion instead of reset.
        </p>

        <div className="mt-6">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isConnecting || connectors.length === 0}
              onClick={() => connect({ connector: connectors[0] })}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
            >
              {isConnecting ? "Connecting..." : "Connect Browser Wallet"}
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm">
            Commitment title
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="30 days sober"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Stake (ETH)
              <input
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                value={stakeEth}
                onChange={(event) => setStakeEth(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Duration (days)
              <input
                type="number"
                min={1}
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                value={durationDays}
                onChange={(event) => setDurationDays(Number(event.target.value))}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowSlip}
              onChange={(event) => setAllowSlip(event.target.checked)}
            />
            Enable compassionate slip system
          </label>

          <button
            type="button"
            disabled={!isConnected || isPending}
            onClick={createCommitment}
            className="mt-2 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            {isPending ? "Submitting..." : "Create Commitment Stake"}
          </button>

          {status ? (
            <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
              {status}
            </p>
          ) : null}
        </div>
      </motion.section>
    </main>
  );
}
