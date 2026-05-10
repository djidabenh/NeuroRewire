import { getAuthorizationHeader } from "./auth-session.js";

class SpeechService {
  constructor() {
    this.stream = null;
    this.stopCurrent = null;
  }

  async requestPermission() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone not supported by this browser.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error("Microphone access denied:", err);
      return false;
    }
  }

  startRecording(maxDuration = 4000) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.stream) {
          const ok = await this.requestPermission();
          if (!ok) {
            return reject(new Error("Permission denied"));
          }
        }

        const audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )({ sampleRate: 44100 });

        const source = audioContext.createMediaStreamSource(this.stream);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.2;

        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        const leftChannel = [];

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          leftChannel.push(new Float32Array(inputData));
        };

        source.connect(gainNode);
        gainNode.connect(processor);
        processor.connect(audioContext.destination);

        const stop = () => {
          if (processor.onaudioprocess === null) return;

          source.disconnect();
          gainNode.disconnect();
          processor.disconnect();
          processor.onaudioprocess = null;

          if (audioContext.state !== "closed") {
            const wavBlob = this.exportWAV(leftChannel, 44100);
            audioContext.close();
            resolve(wavBlob);
          }
        };

        setTimeout(stop, maxDuration);
        this.stopCurrent = stop;
      } catch (err) {
        reject(err);
      }
    });
  }

  stopRecording() {
    if (this.stopCurrent) {
      this.stopCurrent();
      this.stopCurrent = null;
    }
  }

  exportWAV(buffers, sampleRate) {
    const buffer = this.mergeBuffers(buffers);
    const dataview = this.encodeWAV(buffer, sampleRate);
    return new Blob([dataview], { type: "audio/wav" });
  }

  mergeBuffers(buffers) {
    let length = 0;

    for (const b of buffers) {
      length += b.length;
    }

    const result = new Float32Array(length);
    let offset = 0;

    for (const b of buffers) {
      result.set(b, offset);
      offset += b.length;
    }

    return result;
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, "WAVE");
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);

    this.floatTo16BitPCM(view, 44, samples);

    return view;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  async recognize(blob, language) {
    const formData = new FormData();
    formData.append("audio", blob, "recording.wav");
    formData.append("language", language);

    let authHeader = {};

    try {
      authHeader = await getAuthorizationHeader();
    } catch (error) {
      console.warn(
        "Firebase token not available. Using Flask session cookie instead.",
        error
      );
    }

    const response = await fetch("/api/speech-to-text", {
      method: "POST",
      headers: authHeader,
      body: formData,
      credentials: "same-origin",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Speech API error:", payload);
      throw new Error(payload.error || "Backend speech recognition failed");
    }

    return payload;
  }
}

export const speechService = new SpeechService();