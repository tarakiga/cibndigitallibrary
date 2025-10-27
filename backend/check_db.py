import sqlite3

conn = sqlite3.connect('test.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# If content table exists, check its data
if any('content' in str(t).lower() for t in tables):
    table_name = [t[0] for t in tables if 'content' in str(t).lower()][0]
    print(f"\nChecking table: {table_name}")
    
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"Total items: {count}")
    
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
    columns = [description[0] for description in cursor.description]
    print(f"\nColumns: {', '.join(columns)}")
    
    cursor.execute(f"SELECT id, title, content_type, file_url, thumbnail_url FROM {table_name} LIMIT 5")
    rows = cursor.fetchall()
    print(f"\nFirst 5 content items:")
    for row in rows:
        print(f"\nID: {row[0]}")
        print(f"Title: {row[1]}")
        print(f"Type: {row[2]}")
        print(f"File URL: {row[3]}")
        print(f"Thumbnail: {row[4]}")
        print("---")

conn.close()
