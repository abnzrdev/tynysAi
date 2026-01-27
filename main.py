import requests
import json
from datetime import datetime, timezone
import os

# --- CONFIGURATION ---
API_URL = "http://89.218.178.215:5435/api/v1/sensor-data"
# You can set IOT_DEVICE_SECRET as an environment variable or hardcode it here
IOT_DEVICE_SECRET = os.getenv("IOT_DEVICE_SECRET", "change-me")

def test_send_correct_format():
    # Request body in the format expected by the API
    # The API expects: device_id, site, timestamp, readings object, and optional metadata
    payload = {
        "device_id": "lab01",
        "site": "AGI_Lab",
        "timestamp": datetime.now(timezone.utc).isoformat(),  # ISO 8601 format with timezone
        "readings": {
            "pm1": 12.3,
            "pm25": 25.7,
            "pm10": 43.1,
            "co2": 412,
            "voc": 0.65,
            "temp": 21.8,
            "hum": 46.2,
            "ch2o": 0.03,
            "co": 0.1,
            "o3": 18.5,
            "no2": 14.2
        },
        "metadata": {
            "battery": 87,
            "signal": -65,
            "firmware": "2.1.4"
        }
    }

    # Set up headers with authentication
    headers = {
        "Authorization": f"Bearer {IOT_DEVICE_SECRET}",
        "Content-Type": "application/json"
    }

    print(f"🚀 Sending data to {API_URL}...")
    print(f"📦 Request body: {json.dumps(payload, indent=2)}")
    print(f"🔐 Using authentication token: {IOT_DEVICE_SECRET[:10]}...")

    try:
        # Important: use json=payload so requests sets the correct headers
        response = requests.post(API_URL, json=payload, headers=headers, timeout=10)

        print(f"\n📡 Status code: {response.status_code}")
        print(f"💬 Server response: {response.text}")

        if response.status_code == 201:
            print("✅ SUCCESS! Data accepted by the server.")
            try:
                response_data = response.json()
                if "data" in response_data:
                    print(f"   Reading ID: {response_data.get('data', {}).get('readingId', 'N/A')}")
                    print(f"   Sensor ID: {response_data.get('data', {}).get('sensorId', 'N/A')}")
            except:
                pass
        elif response.status_code == 200:
            print("⚠️  WARNING: Server responded with 200 (might be a duplicate reading)")
        elif response.status_code == 401:
            print("❌ AUTHENTICATION ERROR: Invalid or missing credentials.")
            print("   Please check your IOT_DEVICE_SECRET environment variable.")
        elif response.status_code == 400:
            print("❌ VALIDATION ERROR: The server rejected the data format or values.")
        else:
            print(f"❌ ERROR: Server responded with status {response.status_code}")

    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR: Server is unreachable.")
        print("   Please check the IP/Port and Firewall settings on the server side.")
    except requests.exceptions.Timeout:
        print("\n❌ TIMEOUT ERROR: The request took too long to complete.")
    except Exception as e:
        print(f"\n💥 An error occurred: {e}")

if __name__ == "__main__":
    test_send_correct_format()