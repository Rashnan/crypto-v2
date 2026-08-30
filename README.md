# Crypto

An interactive React app for learning modular arithmetic, classical ciphers, and the calculations behind them.

## Included tools

- Extended Euclidean algorithm and GCD
- Additive and multiplicative inverses modulo `m`
- Linear congruences, linear Diophantine equations, and CRT systems
- Matrix inverses modulo `m`
- Additive, multiplicative, affine, substitution, Vigenere, autokey, Playfair, and Hill ciphers

Each cipher page shows its letter or block calculations. Hill decryption also links to the matching matrix-inverse calculation.

## Run locally

```sh
pnpm install
pnpm dev
```

## Checks

```sh
pnpm lint
pnpm test
pnpm build
```

The app uses Vite, React, TypeScript, Chakra UI, and TanStack Router.
