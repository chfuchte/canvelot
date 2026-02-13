import { gunzip, gzip } from "zlib";

export function gzipAsync(buffer: Buffer): Promise<Buffer<ArrayBuffer>> {
    return new Promise((resolve, reject) => {
        gzip(buffer, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

export function gunzipAsync(buffer: Buffer): Promise<Buffer<ArrayBuffer>> {
    return new Promise((resolve, reject) => {
        gunzip(buffer, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
