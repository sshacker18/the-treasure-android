#!/usr/bin/env python3
"""Generate prototype dialogue WAVs for RELIC V2 using Kokoro ONNX."""
from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

def parse_args() -> argparse.Namespace:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model",type=Path,required=True)
    parser.add_argument("--voices",type=Path,required=True)
    parser.add_argument("--output-dir",type=Path,required=True)
    parser.add_argument("--lines",type=Path,default=Path("tools/relic-dialogue-lines.json"))
    return parser.parse_args()

def main() -> None:
    args=parse_args()
    if not args.model.is_file() or not args.voices.is_file():
        raise FileNotFoundError("Kokoro model or voice file is missing.")
    args.output_dir.mkdir(parents=True,exist_ok=True)
    lines=json.loads(args.lines.read_text(encoding="utf-8"))
    if not isinstance(lines,list) or not lines: raise ValueError("Dialogue manifest must be a non-empty JSON array.")
    synthesizer=Kokoro(str(args.model),str(args.voices))
    generated=[]
    for line in lines:
        for key in ("id","speaker","text","voice","speed"):
            if key not in line: raise ValueError(f"Dialogue line missing field: {key}")
        if not str(line["id"]).replace("_","").isalnum(): raise ValueError(f"Unsafe audio id: {line['id']!r}")
        samples,sample_rate=synthesizer.create(str(line["text"]),voice=str(line["voice"]),speed=float(line["speed"]),lang="en-us")
        samples=np.asarray(samples,dtype=np.float32)
        if samples.ndim!=1 or samples.size==0 or sample_rate<=0: raise RuntimeError(f"Invalid audio for {line['id']!r}")
        peak=float(np.max(np.abs(samples)))
        if peak>0.96: samples*=0.96/peak
        output=args.output_dir/f"{line['id']}.wav"
        sf.write(output,samples,int(sample_rate),subtype="PCM_16")
        info=sf.info(output)
        if info.frames<=0 or info.channels!=1 or info.samplerate<16000: raise RuntimeError(f"WAV validation failed: {output}")
        generated.append({"id":line["id"],"speaker":line["speaker"],"text":line["text"],"voice":line["voice"],"file":output.name,"format":"WAV PCM_16 mono","sample_rate":info.samplerate,"duration_seconds":round(info.duration,3),"size_bytes":output.stat().st_size})
        print(f"Generated {output}: {info.duration:.2f}s, {info.samplerate} Hz, {info.channels} channel(s)")
    manifest=args.output_dir/"audio_manifest.json"
    manifest.write_text(json.dumps(generated,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Validated {len(generated)} dialogue WAV files. Manifest: {manifest}")

if __name__=="__main__": main()
