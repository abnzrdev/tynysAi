import serial
import time
import requests
import json
import os
import sys

# --- НАСТРОЙКИ ---
API_URL = "http://89.218.178.215:8087/data"
BUFFER_FILE = "sensor_buffer.jsonl"
SERIAL_PORT = "/dev/ttyS0" # UART Raspberry Pi
BAUD_RATE = 9600

# --- ИДЕНТИФИКАЦИЯ УСТРОЙСТВА ---
DEVICE_ID = "lab01"
SITE_NAME = "AGI_Lab"

# --- КОНФИГУРАЦИЯ ДАТЧИКА ---
FRAME_LEN = 26
CMD_READ = bytes([0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79])

# Калибровка (множитель, смещение)
CAL = {
    "pm1":  (1.0, 0.0),
    "pm25": (1.0, 0.0),
    "pm10": (1.0, 0.0),
    "co2":  (1.0, -200.0),
    "hum":  (1.0, 0.0),
}

# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

def calculate_checksum(data):
    return (~sum(data[1:25]) + 1) & 0xFF

def save_to_buffer(data):
    """Сохраняет данные в файл при отсутствии интернета."""
    try:
        with open(BUFFER_FILE, "a") as f:
            f.write(json.dumps(data) + "\n")
        print("Данные сохранены в буфер.")
    except Exception as e:
        print(f"Ошибка записи в буфер: {e}")

def send_buffered_data():
    """Отправляет накопленные данные."""
    if not os.path.exists(BUFFER_FILE):
        return

    print("Отправка данных из буфера...")
    try:
        with open(BUFFER_FILE, "r") as f:
            lines = f.readlines()

        remaining_lines = []
        sent_count = 0

        for line in lines:
            if not line.strip():
                continue
            try:
                record = json.loads(line)
                response = requests.post(
                    API_URL,
                    json=record,
                    headers={"Content-Type": "application/json"},
                    timeout=5,
                )
                if response.status_code == 200:
                    sent_count += 1
                else:
                    remaining_lines.append(line)
            except Exception:
                remaining_lines.append(line)

        if not remaining_lines:
            os.remove(BUFFER_FILE)
            print(f"Буфер очищен. Отправлено: {sent_count}")
        else:
            with open(BUFFER_FILE, "w") as f:
                f.writelines(remaining_lines)
            print(f"Осталось в буфере: {len(remaining_lines)}")

    except Exception as e:
        print(f"Ошибка буфера: {e}")

def send_data_to_server(data):
    """Отправка JSON на сервер."""
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(
            API_URL,
            json=data,
            headers=headers,
            timeout=5,
        )
        if response.status_code == 200:
            print("Успешно отправлено на сервер.")
            send_buffered_data()
        else:
            print(f"Ошибка сервера {response.status_code}. Сохраняю в буфер.")
            save_to_buffer(data)
    except requests.RequestException:
        print("Нет связи с сервером. Сохраняю в буфер.")
        save_to_buffer(data)

def parse_sensor_data(buf):
    """Парсинг и формирование JSON."""
    if len(buf) != FRAME_LEN:
        return None
    if calculate_checksum(buf) != buf[25]:
        print("Checksum mismatch")
        return None

    # Расчет значений
    pm1  = buf[2]  << 8 | buf[3]
    pm25 = buf[4]  << 8 | buf[5]
    pm10 = buf[6]  << 8 | buf[7]
    co2  = buf[8]  << 8 | buf[9]
    tvoc = buf[10]

    temp_raw = (buf[11] << 8) | buf[12]
    temp = (temp_raw - 435) * 0.1

    hum_raw = (buf[13] << 8) | buf[14]
    hum = (hum_raw - 10) * 1.0

    ch2o = ((buf[15] << 8) | buf[16]) * 0.001
    co   = ((buf[17] << 8) | buf[18]) * 0.1
    o3   = ((buf[19] << 8) | buf[20]) * 0.01
    no2  = ((buf[21] << 8) | buf[22]) * 0.01

    # Калибровка
    raw_vals = {"pm1": pm1, "pm25": pm25, "pm10": pm10, "co2": co2, "hum": hum}

    for k, v in raw_vals.items():
        if k in CAL:
            s, o = CAL[k]
            if k == "hum":
                hum = v * s + o
            elif k == "co2":
                co2 = int(v * s + o)
            elif k == "pm1":
                pm1 = int(v * s + o)
            elif k == "pm25":
                pm25 = int(v * s + o)
            elif k == "pm10":
                pm10 = int(v * s + o)

    data = {
        "device_id": DEVICE_ID,
        "site": SITE_NAME,
        "pm1": pm1,
        "pm25": pm25,
        "pm10": pm10,
        "co2": co2,
        "voc": round(float(tvoc), 2),
        "temp": round(temp, 1),
        "hum": round(hum, 1),
        "ch2o": round(ch2o, 2),
        "co": round(co, 1),
        "o3": round(o3, 1),
        "no2": round(no2, 1),
    }

    return data

# --- ОСНОВНОЙ ЦИКЛ ---
def main():
    print(f"Старт. ID: {DEVICE_ID}, Site: {SITE_NAME}")
    ser = None
    try:
        ser = serial.Serial(SERIAL_PORT, baudrate=BAUD_RATE, timeout=1)
        print("Порт открыт:", SERIAL_PORT)

        while True:
            ser.write(CMD_READ)
            frame = ser.read(FRAME_LEN)

            print("RAW:", len(frame), frame)

            if len(frame) < FRAME_LEN:
                time.sleep(2)
                continue

            sensor_data = parse_sensor_data(frame)

            if sensor_data:
                print(json.dumps(sensor_data, indent=4, ensure_ascii=False))
                send_data_to_server(sensor_data)

            time.sleep(5)

    except serial.SerialException as e:
        print(f"Ошибка порта: {e}")
    except KeyboardInterrupt:
        print("Остановлено с клавиатуры.")
    finally:
        if ser and ser.is_open:
            ser.close()

if __name__ == "__main__":
    main()