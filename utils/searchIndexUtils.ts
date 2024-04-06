

export const searchIndexToJson = (map: Map<string, number[]>): string => {
    const obj = Array.from(map.entries());
    return JSON.stringify(obj);
}

export const jsonToSearchIndex = (jsonStr: string): Map<string, number[]> => {
    const entries = JSON.parse(jsonStr) as [string, number[]][];
    return new Map(entries);
}