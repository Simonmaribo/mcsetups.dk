Open Source version af [McSetups](https://mcsetups.dk) platformen. Udviklet i Feb 2023, så codebasen er kun for educational purposes. Det er meget jeg ikke ville gøre på samme måde, hvis jeg skulle udvikle en ligende platform i dag.


## Teknologier

Backend: Express & Prisma
Frontend: NextJS Pages Router

## Struktur

API og Platformen ligger under `/apps` mappen i dette monorepo. De deler begge `database` dependency fra `/packages` mappen. Dette er en instans af Prisma for e2e typesafety.

![mcsetups](https://github.com/user-attachments/assets/0d862295-5e54-45f2-9e75-dfa01efe4c82)
