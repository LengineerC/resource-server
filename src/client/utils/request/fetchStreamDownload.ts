import { createWriteStream } from 'streamsaver';
import { BASE_URL } from "./ip";
import createUrl from '../../../public/functions/createUrl';

type StreamDownloadOption = {
  filename?: string;
  onProgress?: (loaded: number, total?: number) => void;
  signal?: AbortSignal;
};

type FetchOption = {
  method: "GET" | "POST";
  params?: Record<string, any>;
  headers?: Record<string, string>;
};

if (typeof window !== 'undefined') {
  window.streamSaver.mitm=createUrl(BASE_URL,"streamsaver/mitm.html");
}

export async function fetchStreamDownload(
  url: string,
  options: FetchOption & StreamDownloadOption
) {
  const { method, params, headers, filename, onProgress, signal } = options;
  
  try {
    
    const requestUrl = new URL(
      (BASE_URL[BASE_URL.length-1]==='/'?
          BASE_URL.substring(0,BASE_URL.length-1):
          BASE_URL)
          +url
    );

    if (method === 'GET' && params) {
      Object.entries(params).forEach(([key, value]) => {
        requestUrl.searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(requestUrl.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method === 'POST' ? JSON.stringify(params) : undefined,
      signal
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.body) throw new Error('Empty response body');

    const contentDisposition = response.headers.get('Content-Disposition');
    const finalFilename = filename || (contentDisposition
      ? decodeURIComponent(
          contentDisposition.split('filename*=UTF-8\'\'')[1] || 
          contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        )
      : `download-${Date.now()}`);

    const fileStream = createWriteStream(finalFilename, {
      size: response.headers.get('Content-Length') 
        ? Number(response.headers.get('Content-Length'))
        : undefined
    });

    let loadedBytes = 0;
    const totalBytes = Number(response.headers.get('Content-Length'));
    const progressStream = new TransformStream({
      transform(chunk, controller) {
        loadedBytes += chunk.byteLength;
        onProgress?.(loadedBytes, totalBytes);
        controller.enqueue(chunk);
      }
    });

    await response.body
      .pipeThrough(progressStream)
      .pipeTo(fileStream)
      .catch(err => {
        fileStream.abort();
        throw err;
      });

    return { success: true, filename: finalFilename };
  } catch (err:any) {
    if (err.name === 'AbortError') {
      console.log('Download canceled');
      return { success: false, aborted: true };
    }
    console.error('Download failed:', err);
    return { 
      success: false,
      error: err || 'Unknown error'
    };
  }
}