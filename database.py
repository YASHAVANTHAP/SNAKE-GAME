import sqlite3

conn = sqlite3.connect('snake_game.db')
c = conn.cursor()

# Create the users table
c.execute('''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )''')

# Create the scores table if not exists
c.execute('''CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                score INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )''')

conn.commit()
conn.close()
