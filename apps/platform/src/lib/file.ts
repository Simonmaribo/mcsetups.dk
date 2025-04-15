
export function formatBytes(bytes: number): string {
    if (bytes >= 1073741824) {
        bytes = (bytes / 1073741824);
        return bytes.toFixed(2) + " GB";
    }
    if (bytes >= 1048576) {
        bytes = (bytes / 1048576);
        return bytes.toFixed(2) + " MB";
    }
    if (bytes >= 1024) {
        bytes = (bytes / 1024);
        return bytes.toFixed(2) + " KB";
    }
    return bytes + " bytes";
}