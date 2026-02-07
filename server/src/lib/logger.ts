export type LogLevel = "debug" | "info" | "warn" | "error";

export function logger(options: { name: string; file?: string }) {
    return (level: LogLevel, message: string) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${options.name}${options.file ? `:${options.file}` : ""}] [${level}] ${message}`;
        console.log(logMessage);
    };
}
