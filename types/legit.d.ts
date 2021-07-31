declare module 'legit';

export default function legit(domainName: string): Promise<{isValid: boolean, mxArray: {exchange: string; priority: number}[]}>
