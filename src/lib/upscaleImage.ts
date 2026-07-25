const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.92;

export async function upscaleImage(file: File): Promise<File> {
  const img = await createImageFromFile(file);

  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width >= MAX_WIDTH) return file;

  const ratio = MAX_WIDTH / width;
  width = MAX_WIDTH;
  height = Math.round(height * ratio);

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = img.naturalWidth;
  srcCanvas.height = img.naturalHeight;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0);

  const destCanvas = document.createElement("canvas");
  destCanvas.width = width;
  destCanvas.height = height;

  const pica = (await import("pica")).default();
  await pica.resize(srcCanvas, destCanvas, {
    unsharpAmount: 100,
    unsharpRadius: 0.6,
    unsharpThreshold: 2,
  });

  const blob = await pica.toBlob(destCanvas, file.type || "image/jpeg", JPEG_QUALITY);

  const ext = file.name.split(".").pop() || "jpg";
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, {
    type: blob.type,
  });
}

function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
