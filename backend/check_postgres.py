import psycopg2

try:
    conn = psycopg2.connect('postgresql://cibn_user:Valerian101!@localhost:5432/cibn_library')
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public'")
    tables = cursor.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check for contents table
    table_names = [t[0] for t in tables]
    if 'contents' in table_names:
        print("\nChecking contents table:")
        
        cursor.execute("SELECT COUNT(*) FROM contents")
        count = cursor.fetchone()[0]
        print(f"Total items: {count}")
        
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='contents'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"\nColumns: {', '.join(columns)}")
        
        cursor.execute("SELECT id, title, content_type, file_url, thumbnail_url FROM contents LIMIT 10")
        rows = cursor.fetchall()
        print(f"\nFirst 10 content items:")
        for row in rows:
            print(f"\nID: {row[0]}")
            print(f"Title: {row[1]}")
            print(f"Type: {row[2]}")
            print(f"File URL: {row[3]}")
            print(f"Thumbnail: {row[4]}")
            print("---")
    else:
        print("\n'contents' table not found!")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
