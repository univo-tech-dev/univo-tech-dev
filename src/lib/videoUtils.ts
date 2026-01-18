import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
    if (ffmpeg) return ffmpeg;

    const instance = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await instance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpeg = instance;
    return ffmpeg;
};

export const transcodeVideo = async (
    file: File, 
    onProgress?: (progress: number) => void
): Promise<File> => {
    const ffmpegInstance = await loadFFmpeg();
    const inputName = 'input.' + file.name.split('.').pop();
    const outputName = 'output.mp4';

    await ffmpegInstance.writeFile(inputName, await fetchFile(file));

    if (onProgress) {
        ffmpegInstance.on('progress', ({ progress, time }) => {
            // progress is 0-1
            onProgress(Math.round(progress * 100));
        });
    }

    // -preset ultrafast: fastest encoding (slower upload but fast UX)
    // -crf 28: decent quality, small size
    // -c:v libx264: Force H.264 encoding (Widely compatible)
    // -c:a aac: Audio codec
    await ffmpegInstance.exec([
        '-i', inputName, 
        '-c:v', 'libx264', 
        '-preset', 'ultrafast', 
        '-crf', '28', 
        '-c:a', 'aac', 
        outputName
    ]);

    const data = await ffmpegInstance.readFile(outputName);
    
    // Create new File from output
    const transcodedFile = new File([data as unknown as BlobPart], file.name.replace(/\.[^/.]+$/, "") + ".mp4", {
        type: 'video/mp4'
    });

    // Cleanup
    await ffmpegInstance.deleteFile(inputName);
    await ffmpegInstance.deleteFile(outputName);

    return transcodedFile;
};
