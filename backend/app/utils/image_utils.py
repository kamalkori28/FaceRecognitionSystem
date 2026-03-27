from __future__ import annotations

import base64

import cv2
import numpy as np


def decode_data_url(image_data_url: str):
    if "," not in image_data_url:
        raise ValueError("Expected a data URL payload")

    _, encoded = image_data_url.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Unable to decode frame")
    return frame
