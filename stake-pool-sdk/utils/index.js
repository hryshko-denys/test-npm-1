import { LAMPORTS_PER_SOL } from '@solana/web3.js';
function lamportsToSol(lamports) {
    if (typeof lamports === 'number') {
        return Math.abs(lamports) / LAMPORTS_PER_SOL;
    }
    let signMultiplier = 1;
    if (lamports.isNeg()) {
        signMultiplier = -1;
    }
    const absLamports = lamports.abs();
    const lamportsString = absLamports.toString(10).padStart(10, '0');
    const splitIndex = lamportsString.length - 9;
    const solString = `${lamportsString.slice(0, splitIndex)}.${lamportsString.slice(splitIndex)}`;
    return signMultiplier * parseFloat(solString);
}
function solToLamports(amount) {
    if (Number.isNaN(amount))
        return Number(0);
    return Number(amount * LAMPORTS_PER_SOL);
}
export { lamportsToSol, solToLamports };
