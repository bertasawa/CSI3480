import sqlite3

conn = sqlite3.connect("users.db")
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT username, password_hash FROM users")
rows = cur.fetchall()
print("users in DB:\n============================================")
for row in rows:
    print("username:  ", row["username_hash"], "\npassword:  ", row["password_hash"], "\n")
    
print("============================================")

cur.execute("SELECT * FROM users")
column_names = [description[0] for description in cur.description]

print("column names\n", column_names)