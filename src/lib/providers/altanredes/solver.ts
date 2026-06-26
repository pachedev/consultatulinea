import crypto from "node:crypto";

type ChallengePair = [string, string];

interface ChallengeInput {
  challenge: {
    c: number;
    s: number;
    d: number;
  };
  token: string;
  expires?: number;
}

interface ChallengeSolution {
  token: string;
  solutions: number[];
}

export function prng(seed: string, length: number): string {
  let state = 2166136261 >>> 0;

  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state =
      (state +
        ((state << 1) +
          (state << 4) +
          (state << 7) +
          (state << 8) +
          (state << 24))) >>>
      0;
  }

  let result = "";

  while (result.length < length) {
    state ^= state << 13;
    state >>>= 0;

    state ^= state >>> 17;
    state >>>= 0;

    state ^= state << 5;
    state >>>= 0;

    result += state.toString(16).padStart(8, "0");
  }

  return result.substring(0, length);
}

export function generateChallenges(
  token: string,
  c: number,
  s: number,
  d: number,
): ChallengePair[] {
  const challenges: ChallengePair[] = [];

  for (let i = 1; i <= c; i++) {
    const salt = prng(`${token}${i}`, s);
    const target = prng(`${token}${i}d`, d);
    challenges.push([salt, target]);
  }

  return challenges;
}

export function solveChallenge(salt: string, target: string): number {
  let nonce = 0;

  while (true) {
    const hash = crypto
      .createHash("sha256")
      .update(salt + nonce)
      .digest("hex");

    if (hash.startsWith(target)) {
      return nonce;
    }

    nonce++;
  }
}

export function solveCapChallenge(
  challengeResponse: ChallengeInput,
): ChallengeSolution {
  const { challenge, token } = challengeResponse;
  const { c, s, d } = challenge;

  const challenges = generateChallenges(token, c, s, d);

  const solutions = challenges.map(([salt, target]) =>
    solveChallenge(salt, target),
  );

  return { token, solutions };
}
