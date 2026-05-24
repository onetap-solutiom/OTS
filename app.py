"""
Root-level app shim.
All source code lives in the `backend/` subdirectory.
This file adds `backend/` to sys.path so that the root-level
app.py can be used as an entry point without moving files.
"""
import sys
import os

# Ensure backend/ is on the path so all imports resolve correctly
_backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Re-export everything from the real app module inside backend/
from backend.app import create_app, app  # noqa: F401

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
