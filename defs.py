from app.db import get_db
from werkzeug.security import check_password_hash, generate_password_hash
from flask import g, session, make_response

def get_tree(photo, folder, label):
    if 'tree' not in g:
        #photo = 'static/photo.jpeg'
        #folder = 'static/folder.png'
        tree = {'id': 0, label: 'Породы', 'photo': folder, 'children': []}
        db = get_db()
        breeds = db.execute('SELECT * FROM breeds').fetchall()
        for breed in breeds:
            brd = {'id': -(breed['id']*10 + 1), label: breed['breed'], 'photo': folder, 'children': []}
            bb = {'id': -(breed['id']*10 + 2), label: 'Щенки на продажу', 'photo': folder, 'children': []}
            sqlstr = "SELECT id, dogname FROM dogs WHERE breed = ? AND mam != ''"
            babies = db.execute( sqlstr, (breed['id'],)).fetchall()
            for baby in babies:
                bb['children'].append({'id': baby['id'], label: baby['dogname'], 'photo': photo, 'children': []})
            brd['children'].append(bb)
            mm = {'id': -(breed['id']*10 + 3), label:'Мамы', 'photo': folder,'children':[]}
            sqlstr = "SELECT DISTINCT mam FROM dogs WHERE breed LIKE ? AND mam != ''" 
            mams = db.execute( sqlstr, (breed['id'],)).fetchall()
            for mam in mams:
                sqlstr = "SELECT id, dogname FROM dogs WHERE id = ?"
                ma = db.execute( sqlstr, (mam['mam'],)).fetchone()
                mm['children'].append({'id':ma['id'], label:ma['dogname'], 'photo': photo, 'children':[]})
            brd['children'].append(mm)
            dd = {'id': -(breed['id']*10 + 4), label:'Папы', 'photo': folder,'children':[]}
            sqlstr = "SELECT DISTINCT dad FROM dogs WHERE breed LIKE ? AND dad != ''" 
            dads = db.execute( sqlstr, (breed['id'],)).fetchall()
            for dad in dads:
                sqlstr = "SELECT id, dogname FROM dogs WHERE id = ?"
                da = db.execute( sqlstr, (dad['dad'],)).fetchone()
                dd['children'].append({'id':da['id'], label:da['dogname'], 'photo': photo, 'children':[]})
            brd['children'].append(dd)
            tree['children'].append(brd)
        """
        print(f"{tree['id']} {tree[label]} {tree['photo']}")
        for brd in tree['children']:
            print(f"{brd['id']} {brd[label]} {brd['photo']}")
            for ttl in brd['children']:
                print(f"{ttl['id']} {ttl[label]} {ttl['photo']}")
                for dogs in ttl['children']:
                    print(f"{dogs['id']} {dogs[label]} {dogs['photo']}")
        """
        g.tree = tree
    
    return g.tree

def get_details(id):
    db = get_db()
    details = db.execute("SELECT * FROM dogs WHERE id = ?", (id,)).fetchone()
    jsn = {}
    jsn['nick'] = details['nick']
    jsn['birthday'] = details['birthday'].strftime("%d-%m-%Y")
    jsn['breed'] = jsn['subbreed'] = jsn['mam'] = jsn['dad'] = ''
    if (details['breed']):
        breed = db.execute("SELECT breed FROM breeds WHERE id =?", (details['breed'],)).fetchone()
        jsn['breed'] = breed['breed']
    if (details['subbreed']):
        subbreed = db.execute("SELECT subbreed FROM subbreeds WHERE id =?", (details['subbreed'],)).fetchone()
        jsn['subbreed'] = subbreed['subbreed']
    if (details['mam']):
        jsn['mamID'] = details['mam']
        mam = db.execute("SELECT dogname FROM dogs WHERE id =?", (details['mam'],)).fetchone()
        jsn['mam'] = mam['dogname']
    if (details['dad']):
        jsn['dadID'] = details['dad']
        dad = db.execute("SELECT dogname FROM dogs WHERE id =?", (details['dad'],)).fetchone()
        jsn['dad'] = dad['dogname']
    return jsn

def to_register(username, password):
    db = get_db()
    error = None
    if not username:
        error = "Пользователь должен быть указан"
    elif not password:
        error = "Пароль должен быть указан"
    elif db.execute(
        'SELECT id FROM user WHERE username = ?', (username,)
    ).fetchone() is not None:
        error = "Пользователь уже зарегистрирован"

    if error is None:
        db.execute(
            'INSERT INTO user (username, password) VALUES (?, ?)',
            (username, generate_password_hash(password))
        )
        db.commit()
    return { 'error': error }

def to_login(username, password):
    db = get_db()
    error = None
    user = db.execute(
        'SELECT * FROM user WHERE username = ?', (username,)
    ).fetchone()

    if user is None:
        error = "Пользователь не найден"
    elif not check_password_hash(user['password'], password):
        error = "Не правильный пароль"

    if error is None:
        session.clear()
        session['user_id'] = user['id']
    return { 'error': error }

def to_logout():
    session.clear()
    return 'ok'

def to_load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()



