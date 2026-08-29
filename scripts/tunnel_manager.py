import subprocess
import time
import sys
import re

def run_persistent_tunnel(port, name="v1"):
    cmd = [
        "ssh",
        "-o", "ServerAliveInterval=30",
        "-o", "ServerAliveCountMax=3",
        "-o", "ExitOnForwardFailure=yes",
        "-o", "StrictHostKeyChecking=no",
        "-R", f"80:127.0.0.1:{port}",
        "serveo.net"
    ]
    
    print(f"[*] Starting persistent tunnel for {name} on port {port}...")
    while True:
        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            for line in iter(process.stdout.readline, ''):
                if line:
                    sys.stdout.write(f"[{name.upper()}] {line}")
                    sys.stdout.flush()
            process.wait()
            print(f"[!] Tunnel {name} disconnected. Reconnecting in 3s...")
            time.sleep(3)
        except Exception as e:
            print(f"[ERROR] {e}. Retrying in 5s...")
            time.sleep(5)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    name = sys.argv[2] if len(sys.argv) > 2 else "v1"
    run_persistent_tunnel(port, name)
