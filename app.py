from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_bcrypt import Bcrypt
import sqlite3

app = Flask(__name__)
app.secret_key = 'your_secret_key'
bcrypt = Bcrypt(app)

def get_db_connection():
    conn = sqlite3.connect('snake_game.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    if 'user_id' in session:
        return render_template('index.html')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
        if user and bcrypt.check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('index'))
        else:
            return 'Invalid username or password'
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
        conn = get_db_connection()
        try:
            conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
            conn.commit()
        except sqlite3.IntegrityError:
            return 'Username already taken'
        conn.close()
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/submit_score', methods=['POST'])
def submit_score():
    if 'user_id' not in session:
        return jsonify(success=False)
    score = request.json['score']
    conn = get_db_connection()
    conn.execute('INSERT INTO scores (user_id, score) VALUES (?, ?)', (session['user_id'], score))
    conn.commit()
    conn.close()
    return jsonify(success=True)

@app.route('/get_high_score')
def get_high_score():
    if 'user_id' not in session:
        return jsonify(score=0)
    conn = get_db_connection()
    high_score = conn.execute('SELECT MAX(score) AS high_score FROM scores WHERE user_id = ?', (session['user_id'],)).fetchone()
    conn.close()
    return jsonify(score=high_score['high_score'] if high_score['high_score'] else 0)

if __name__ == '__main__':
    app.run(debug=True)
