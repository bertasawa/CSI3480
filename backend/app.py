from flask import Flask, request, jsonify, send_from_directory
import bcrypt
import sqlite3
from database import get_db
import secrets
import our_hash

app = Flask(__name__, static_folder="../frontend", static_url_path="")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Backend is connected"}), 200


@app.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    hash_type = data.get("hash_type")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if hash_type == "bcrypt":
        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
    elif hash_type == "our_sha1":
        hashed_password = our_hash.our_sha1(password)
    else:
        return jsonify({"error": "hash_type required"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, hashed_password),
        )
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    hash_type = data.get("hash_type")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "Invalid username or password"}), 401

    stored_hash = row["password_hash"]

    if hash_type == "bcrypt":
        stored_bytes = stored_hash.encode("utf-8")
        if bcrypt.checkpw(password.encode("utf-8"), stored_bytes):
            return jsonify({"message": "Login successful"}), 200

    elif hash_type == "our_sha1":
        if our_hash.our_sha1(password) == stored_hash:
            return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Invalid username or password"}), 401


@app.route("/api/strong_password", methods=["GET"])
def strong_password():
    with open("google-10000-english.txt", "r", encoding="utf-8") as file:
        words = [w.strip() for w in file.readlines()]

    rng = secrets.SystemRandom()
    password = " ".join(rng.choice(words) for _ in range(6))
    return jsonify({"password": password})


@app.route("/")
def welcome_page():
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    print(">>> Starting Flask backend on http://127.0.0.1:5000 ...")
    app.run(debug=True, use_reloader=False)
