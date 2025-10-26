declare module 'streamsaver' {
  interface StreamSaverOptions {
    size?: number;
  }

  interface StreamSaver {
    mitm: string;
    createWriteStream(filename: string, options?: StreamSaverOptions): WritableStream;
    WritableStream: typeof WritableStream;
    supported: boolean;
    version: {
      full: string;
      major: number;
      minor: number;
      dot: number;
    };
  }

  const streamSaver: StreamSaver;
  export = streamSaver;
}

declare global {
  interface Window {
    streamSaver: {
      mitm: string;
      createWriteStream(filename: string, options?: { size?: number }): WritableStream;
    };
  }
}
