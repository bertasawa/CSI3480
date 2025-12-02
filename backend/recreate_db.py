from database import init_db
import os

print("This is destructive.\nDelete and recreate database? Y/N: ")
user_in = input()

if user_in == "y" or user_in == "Y":
	if os.path.exists("users.db"):
		os.remove("users.db")
		print("users.db recreated")
		init_db()
	else:
		print("users.db not found, creating")
		init_db()
else:
	print("No selected. No action taken")

exit()