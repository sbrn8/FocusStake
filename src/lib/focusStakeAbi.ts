export const focusStakeAbi = [
  {
    type: "function",
    name: "createCommitment",
    stateMutability: "payable",
    inputs: [
      { name: "title", type: "string" },
      { name: "deadline", type: "uint256" },
      { name: "allowSlip", type: "bool" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "markSucceeded",
    stateMutability: "nonpayable",
    inputs: [{ name: "commitmentId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "recordSlip",
    stateMutability: "nonpayable",
    inputs: [{ name: "commitmentId", type: "uint256" }],
    outputs: [],
  },
] as const;
