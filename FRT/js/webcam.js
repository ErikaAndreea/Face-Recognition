export async function startWebcam(videoElement, constraints) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Webcam API unavailable in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: constraints,
    audio: false
  });

  videoElement.srcObject = stream;

  await new Promise((resolve, reject) => {
    videoElement.onloadedmetadata = () => {
      videoElement.play().then(resolve).catch(reject);
    };
  });
}
