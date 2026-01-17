import os
import sys

# Set up environment
os.environ['DB_URL'] = 'postgresql://admin:password123@localhost:5432/tynysdb'

# Add project root to path
sys.path.insert(0, '/home/abenezer/Projects/tynysAi')

from lib.db import db
from lib.db.schema import users, sensorReadings
from sqlalchemy import func

# Get all users
result = db.execute("SELECT id, email, name, is_admin, created_at FROM users ORDER BY created_at DESC")
users_list = result.fetchall()

print("\n=== USERS IN PRODUCTION DATABASE ===")
print(f"Total Users: {len(users_list)}\n")

for user in users_list:
    user_id, email, name, is_admin, created_at = user
    print(f"ID: {user_id}")
    print(f"Email: {email}")
    print(f"Name: {name}")
    print(f"Admin: {is_admin}")
    print(f"Created: {created_at}")
    
    # Count sensor readings for this user
    reading_result = db.execute(f"SELECT COUNT(*) FROM sensor_readings WHERE user_id = '{user_id}'")
    reading_count = reading_result.fetchone()[0]
    print(f"Sensor Readings Ingested: {reading_count}")
    print("-" * 50)

# Get total sensor readings
total_result = db.execute("SELECT COUNT(*) FROM sensor_readings")
total_readings = total_result.fetchone()[0]
print(f"\nTOTAL SENSOR READINGS IN DATABASE: {total_readings}")
