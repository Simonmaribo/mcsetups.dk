export function metadataMatchesType<T extends {}>(type: T, metadata: any): boolean {
    return Object.keys(type).every(key => metadata[key] !== undefined);
}