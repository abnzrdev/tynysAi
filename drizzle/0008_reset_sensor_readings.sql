-- Custom migration to drop all data and fix schema issues for sensor_readings

-- 1. Drop and recreate the table to ensure a clean schema (data will be lost)
DROP TABLE IF EXISTS sensor_readings CASCADE;

CREATE TABLE sensor_readings (
  reading_id SERIAL PRIMARY KEY,
  server_received_at TIMESTAMP,
  pm1 REAL,
  pm25 REAL,
  pm10 REAL,
  co2 REAL,
  co REAL,
  o3 REAL,
  no2 REAL,
  voc REAL,
  ch2o REAL,
  temperature REAL,
  humidity REAL,
  pressure REAL,
  battery_level REAL,
  signal_strength REAL,
  error_code INTEGER,
  data_quality_score REAL,
  data_hash TEXT,
  sensor_id INTEGER
);

-- Add indexes/constraints as needed
