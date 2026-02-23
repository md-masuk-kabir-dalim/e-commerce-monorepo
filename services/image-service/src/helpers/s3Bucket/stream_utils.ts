import { Readable } from "stream";
import { Request, Response } from "express";

export interface StreamHandler {
  pipe: (res: Response) => void;
  destroy: () => void;
}

/**
 * Convert various stream types to a unified interface
 */
export function createStreamHandler(streamBody: any): StreamHandler {
  if (streamBody && typeof streamBody.pipe === "function") {
    const nodeStream = streamBody as NodeJS.ReadableStream;

    return {
      pipe: (res: Response) => {
        nodeStream.pipe(res);
      },
      destroy: () => {
        // Check if it's a Node.js Readable with destroy method
        if (
          "destroy" in nodeStream &&
          typeof (nodeStream as any).destroy === "function"
        ) {
          (nodeStream as any).destroy();
        }
      },
    };
  }

  // Check if it's a Web ReadableStream
  if (streamBody && typeof streamBody.getReader === "function") {
    const webStream = streamBody as ReadableStream<Uint8Array>;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let isDestroyed = false;

    return {
      pipe: (res: Response) => {
        reader = webStream.getReader();

        const pump = async () => {
          try {
            while (!isDestroyed && !res.destroyed) {
              const { done, value } = await reader!.read();

              if (done) {
                if (!res.destroyed) {
                  res.end();
                }
                break;
              }

              if (!res.destroyed && !isDestroyed) {
                const success = res.write(Buffer.from(value));
                if (!success) {
                  // Wait for drain event if buffer is full
                  await new Promise((resolve) => {
                    res.once("drain", resolve);
                    res.once("close", resolve);
                  });
                }
              }
            }
          } catch (error) {
            if (!res.headersSent && !isDestroyed) {
              res.status(500).json({
                success: false,
                message: "Stream error occurred",
              });
            }
          }
        };

        pump();
      },
      destroy: () => {
        isDestroyed = true;
        if (reader) {
          try {
            reader.cancel();
            reader.releaseLock();
          } catch (e) {
            // Reader might already be released
          }
          reader = null;
        }
      },
    };
  }

  // Fallback for other types (Buffer, Uint8Array, etc.)
  if (streamBody) {
    const buffer = Buffer.isBuffer(streamBody)
      ? streamBody
      : Buffer.from(streamBody);
    const readable = Readable.from(buffer);

    return {
      pipe: (res: Response) => {
        readable.pipe(res);
      },
      destroy: () => {
        readable.destroy();
      },
    };
  }

  throw new Error("Unsupported stream type");
}

/**
 * Enhanced stream handler with automatic cleanup
 */
export function handleStreamResponse(
  streamBody: any,
  req: Request,
  res: Response,
  videoId: string
): void {
  let streamHandler: StreamHandler;

  try {
    streamHandler = createStreamHandler(streamBody);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Unsupported stream type",
      });
    }
    return;
  }

  // Handle client disconnect
  req.on("close", () => {
    streamHandler.destroy();
  });

  // Handle response errors
  res.on("error", (error) => {
    streamHandler.destroy();
  });

  // Handle response finish
  res.on("finish", () => {
    streamHandler.destroy();
  });

  // Start streaming
  try {
    streamHandler.pipe(res);
  } catch (error) {
    streamHandler.destroy();
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to start video stream",
      });
    }
  }
}
