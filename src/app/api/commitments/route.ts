import { NextResponse } from "next/server";

type CommitmentRecord = {
  wallet: string;
  title: string;
  txHash: string;
  createdAt: string;
};

const commitments: CommitmentRecord[] = [];

export async function GET() {
  return NextResponse.json({ commitments });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CommitmentRecord>;

  if (!body.wallet || !body.title || !body.txHash) {
    return NextResponse.json(
      { error: "wallet, title, and txHash are required" },
      { status: 400 },
    );
  }

  const record: CommitmentRecord = {
    wallet: body.wallet,
    title: body.title,
    txHash: body.txHash,
    createdAt: new Date().toISOString(),
  };

  commitments.unshift(record);

  return NextResponse.json({ record }, { status: 201 });
}
