from typing import Dict, List

DEFAULT_UPLOAD_ALLOWED_EXTENSIONS: Dict[str, List[str]] = {
    "document": [".pdf", ".doc", ".docx", ".txt", ".md"],
    "video": [".mp4", ".webm", ".mov", ".avi", ".mkv"],
    "audio": [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
    "image": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
}

DEFAULT_UPLOAD_MAX_FILE_SIZES: Dict[str, int | None] = {
    "document": 50 * 1024 * 1024,
    "video": None,
    "audio": None,
    "image": 10 * 1024 * 1024,
}
