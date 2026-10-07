# @author: adibarra (Alec Ibarra)
# @description: Configuration file for the server.

import os
import sys
from typing import List

from dotenv import load_dotenv

# check if running in production mode
IS_PRODUCTION: bool = bool(set(["--prod", "--production"]) & set(sys.argv))

# load environment variables
env_file = ".env.production" if IS_PRODUCTION else ".env.development"
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
env_path = os.path.join(root_dir, env_file)

if not load_dotenv(dotenv_path=env_path) and not load_dotenv(
    dotenv_path=os.path.join("..", "..", env_file)
):
    if not os.environ.get("SERVER_API_HOST"):
        print(
            f"Failed to load environment vars... Does '{env_file}' exist?",
            flush=True,
        )


# server configuration
API_HOST: str = os.environ.get("SERVER_API_HOST", "localhost")
API_PORT: int = int(os.environ.get("SERVER_API_PORT", "3332") or 3332)
API_CORS_ORIGINS: List[str] = (os.environ.get("SERVER_API_CORS_ORIGINS") or "*").split(
    ","
)
POSTGRESQL_URI: str = os.environ.get("SERVER_POSTGRESQL_URI", "")
APCA_API_KEY: str = os.environ.get("SERVER_APCA_API_KEY", "")
APCA_API_SECRET: str = os.environ.get("SERVER_APCA_API_SECRET_KEY", "")
