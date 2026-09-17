import sys
import subprocess
import speech_recognition as sr
from pydub import AudioSegment
import urllib.request

def transcribe(audio_path_or_url):
    mp3_file = "/tmp/recaptcha_audio.mp3"
    wav_file = "/tmp/recaptcha_audio.wav"

    if audio_path_or_url.startswith("http://") or audio_path_or_url.startswith("https://"):
        req = urllib.request.Request(
            audio_path_or_url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req) as resp, open(mp3_file, "wb") as f:
            f.write(resp.read())
    else:
        with open(audio_path_or_url, "rb") as src, open(mp3_file, "wb") as dst:
            dst.write(src.read())

    # Convert mp3 to wav using ffmpeg / pydub
    sound = AudioSegment.from_mp3(mp3_file)
    sound.export(wav_file, format="wav")

    r = sr.Recognizer()
    with sr.AudioFile(wav_file) as source:
        audio = r.record(source)

    text = r.recognize_google(audio)
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: solve_recaptcha_audio.py <audio_file_or_url>")
        sys.exit(1)
    try:
        result = transcribe(sys.argv[1])
        print(result)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
