// Camera QR scanner for the door: reads frames from the camera and decodes them with jsQR.
const JSQR = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";

let loading = null;
function loadJsQR() {
  if (window.jsQR) return Promise.resolve();
  loading ||= new Promise((resolve, reject) => {
    const s = Object.assign(document.createElement("script"), { src: JSQR, onload: resolve, onerror: () => reject(new Error("jsQR")) });
    document.head.appendChild(s);
  });
  return loading;
}

// Starts scanning into `video`; calls onCode(text) for each new code. Returns a stop() function.
export async function startScanner(video, onCode) {
  await loadJsQR();
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  video.srcObject = stream;
  video.setAttribute("playsinline", "");
  await video.play();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let last = "", lastAt = 0, running = true;

  const tick = () => {
    if (!running) return;
    if (video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const found = window.jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" });
      // The same code is ignored for 3 seconds, so one ticket isn't checked twice in a row
      if (found?.data && (found.data !== last || Date.now() - lastAt > 3000)) {
        last = found.data; lastAt = Date.now();
        onCode(found.data);
      }
    }
    setTimeout(tick, 200);
  };
  tick();

  return () => {
    running = false;
    stream.getTracks().forEach((tr) => tr.stop());
    video.srcObject = null;
  };
}

// Short feedback sound: high for accepted, low for refused
export function beep(ok) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.12 : 0.35));
    navigator.vibrate?.(ok ? 60 : [80, 60, 80]);
  } catch { /* audio unavailable */ }
}
