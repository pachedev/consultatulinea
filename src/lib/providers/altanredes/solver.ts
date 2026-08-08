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

// Cada cuántos hashes le devolvemos el control al event loop. Suficientemente
// chico para que los sockets de los otros providers se atiendan a tiempo, y
// suficientemente grande para que el costo del setImmediate sea despreciable
// frente al hashing.
const YIELD_EVERY_HASHES = 4096;

// Tope para un solo challenge. Si Altan sube la dificultad, preferimos que se
// vea como un error del provider (route.ts ya lo maneja) y no como un proceso
// girando indefinidamente.
const SOLVE_TIME_BUDGET_MS = 30_000;

export async function solveChallenge(
  salt: string,
  target: string,
): Promise<number> {
  let nonce = 0;
  const deadline = Date.now() + SOLVE_TIME_BUDGET_MS;

  while (true) {
    const hash = crypto
      .createHash("sha256")
      .update(salt + nonce)
      .digest("hex");

    if (hash.startsWith(target)) {
      return nonce;
    }

    nonce++;

    // Este loop es CPU-bound y Node lo corre en el mismo hilo que atiende la
    // I/O de todos los demás operadores. Resuelto de forma síncrona, retiene
    // ese hilo todo lo que tarde la prueba de trabajo: las respuestas que ya
    // llegaron de otros operadores se quedan sin leer en el buffer del socket y
    // sus timeouts disparan tarde. El síntoma es "Telcel dio timeout" cuando en
    // realidad Altan tenía secuestrado el loop.
    if (nonce % YIELD_EVERY_HASHES === 0) {
      if (Date.now() > deadline) {
        throw new Error("Altan challenge solve exceeded its time budget");
      }

      await new Promise((resolve) => setImmediate(resolve));
    }
  }
}

export async function solveCapChallenge(
  challengeResponse: ChallengeInput,
): Promise<ChallengeSolution> {
  const { challenge, token } = challengeResponse;
  const { c, s, d } = challenge;

  const challenges = generateChallenges(token, c, s, d);

  // Secuencial a propósito: cada solve ya cede el control, así que resolverlos
  // uno tras otro mantiene el loop respondiendo todo el tiempo. Hacerlos en
  // paralelo tampoco ayudaría: compiten por el mismo hilo.
  const solutions: number[] = [];
  for (const [salt, target] of challenges) {
    solutions.push(await solveChallenge(salt, target));
  }

  return { token, solutions };
}
