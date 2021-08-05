// Type definitions for legit 1.0.9
// Project: https://github.com/martyndavies/legit
// Definitions by: guy.berliner@gmail.com http://github.com/gberliner/types-legit
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'legit' {
    export default function legit(emailAddress: string): Promise<{isValid: boolean, mxArray: {exchange: string; priority: number}[]}>
}
