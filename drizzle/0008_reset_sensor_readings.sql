-- Migration: drop and recreate sensor_readings to match the authoritative schema.ts

DROP TABLE IF EXISTS sensor_readings CASCADE;

CREATE TABLE sensor_readings (
  reading_id         SERIAL PRIMARY KEY,
  sensor_id          INTEGER NOT NULL REFERENCES sensors(sensor_id),
  timestamp          TIMESTAMP NOT NULL,
  server_received_at TIMESTAMP NOT NULL DEFAULT now(),

  -- Particulate Matter (μg/m³)
  pm1                DOUBLE PRECISION,
  pm25               DOUBLE PRECISION,
  pm10               DOUBLE PRECISION,

  -- Gases
  co2                DOUBLE PRECISION,
  co                 DOUBLE PRECISION,
  o3                 DOUBLE PRECISION,
  no2                DOUBLE PRECISION,

  -- Volatile Organic Compounds
  voc                DOUBLE PRECISION,
  ch2o               DOUBLE PRECISION,

  -- Environmental Conditions
  temperature        DOUBLE PRECISION,
  humidity           DOUBLE PRECISION,
  pressure           DOUBLE PRECISION,

  -- Sensor Status
  battery_level      INTEGER,
  signal_strength    INTEGER,
  error_code         TEXT,
  data_quality_score DOUBLE PRECISION,

  -- Legacy / backward-compat fields
  value              DOUBLE PRECISION,
  location           TEXT,
  transport_type     TEXT,
  user_id            INTEGER REFERENCES users(id),
  ingested_at        TIMESTAMP NOT NULL DEFAULT now(),

  -- Deduplication
  data_hash          TEXT
);

CREATE INDEX IF NOT EXISTS sensor_readings_timestamp_idx
  ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS sensor_readings_sensor_timestamp_idx
  ON sensor_readings(sensor_id, timestamp);
CREATE INDEX IF NOT EXISTS sensor_readings_sensor_id_idx
  ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS sensor_readings_data_hash_idx
  ON sensor_readings(data_hash);
