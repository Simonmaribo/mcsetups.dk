import http from "@/api/http";

export default function downloadRelease({ releaseId }: { releaseId?: string | number } = {}) {
    window.open(`${http.defaults.baseURL}/products/releases/${releaseId}/download`, "_blank");
}
