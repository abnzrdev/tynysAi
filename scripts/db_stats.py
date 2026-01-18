#!/usr/bin/env python3
import subprocess
import sys

try:
    # Query users
    result = subprocess.run(
        ['psql', '-h', 'localhost', '-U', 'admin', '-d', 'tynysdb', '-t', '-A', '-F', '|', '-c',
         'SELECT id, email, name, is_admin, created_at FROM users ORDER BY created_at DESC;'],
        capture_output=True,
        text=True,
        env={'PGPASSWORD': 'password123'}
    )
    
    if result.returncode != 0:
        print(f"Error querying users: {result.stderr}")
        sys.exit(1)
    
    users = []
    for line in result.stdout.strip().split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) >= 5:
                users.append({
                    'id': parts[0],
                    'email': parts[1],
                    'name': parts[2],
                    'is_admin': parts[3],
                    'created_at': parts[4]
                })
    
    print("\n=== PRODUCTION DATABASE STATISTICS ===\n")
    print(f"Total Users: {len(users)}\n")
    
    for user in users:
        print(f"ID: {user['id']}")
        print(f"Email: {user['email']}")
        print(f"Name: {user['name']}")
        print(f"Admin: {user['is_admin']}")
        print(f"Created: {user['created_at']}")
        
        # Count readings for user
        count_result = subprocess.run(
            ['psql', '-h', 'localhost', '-U', 'admin', '-d', 'tynysdb', '-t', '-A', '-c',
             f"SELECT COUNT(*) FROM sensor_readings WHERE user_id = '{user['id']}';"],
            capture_output=True,
            text=True,
            env={'PGPASSWORD': 'password123'}
        )
        
        count = count_result.stdout.strip()
        print(f"Sensor Readings Ingested: {count}")
        print('-' * 60)
    
    # Get total readings
    total_result = subprocess.run(
        ['psql', '-h', 'localhost', '-U', 'admin', '-d', 'tynysdb', '-t', '-A', '-c',
         'SELECT COUNT(*) FROM sensor_readings;'],
        capture_output=True,
        text=True,
        env={'PGPASSWORD': 'password123'}
    )
    
    total = total_result.stdout.strip()
    print(f"\nTOTAL SENSOR READINGS: {total}\n")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
