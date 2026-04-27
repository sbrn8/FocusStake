# FocusStake

FocusStake is a Web3 accountability dApp for ADHD support, addiction recovery,
and habit formation.

Users stake ETH on personal commitments, recover stake on success, and can use
a compassionate slip system to pause progress instead of full reset.

## Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- Web3 UI: Wagmi, Viem, RainbowKit
- Contracts: Solidity, Hardhat, OpenZeppelin
- API: Next.js route handlers (deploy-friendly on Vercel)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Add environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Contract Workflow

Compile contracts:

```bash
npm run contracts:compile
```

Deploy to Sepolia:

```bash
npm run contracts:deploy:sepolia
```

Set the deployed address in `.env.local`:

```bash
NEXT_PUBLIC_FOCUSSTAKE_CONTRACT_ADDRESS=0x...
```

## Current Product Flow

- Connect wallet using RainbowKit
- Create a commitment with title, duration, and ETH amount
- Submit `createCommitment` on the `FocusStake` contract
- Track commitment metadata via `src/app/api/commitments/route.ts` (starter in-memory API)
