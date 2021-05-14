import os
import json
from flask import Flask, render_template
from app.db import get_db

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'app.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    from . import db
    db.init_app(app)

    @app.route('/')
    
    def pet_shop():
        #class Node:
            #def __init__(self, label) :
                #self.label = label
                #self.children = []
        tree = {'id': 0, 'label': 'Породы', 'children': []}
        db = get_db()
        breeds = db.execute('SELECT * FROM breeds').fetchall()
        for breed in breeds:
            brd = {'id': -(breed['id']*10 + 1), 'label': breed['breed'], 'children': []}
            bb = {'id': -(breed['id']*10 + 2), 'label': 'Щенки на продажу', 'children': []}
            sqlstr = "SELECT id, dogname FROM dogs WHERE breed = ? AND mam != ''"
            babies = db.execute( sqlstr, (breed['id'],)).fetchall()
            for baby in babies:
                bb['children'].append({'id': baby['id'], 'label': baby['dogname'], 'children': []})
            brd['children'].append(bb)
            mm = {'id': -(breed['id']*10 + 3), 'label':'Мамы','children':[]}
            sqlstr = "SELECT DISTINCT mam FROM dogs WHERE breed LIKE ? AND mam != ''" 
            mams = db.execute( sqlstr, (breed['id'],)).fetchall()
            for mam in mams:
                sqlstr = "SELECT id, dogname FROM dogs WHERE id = ?"
                ma = db.execute( sqlstr, (mam['mam'],)).fetchone()
                mm['children'].append({'id':ma['id'], 'label':ma['dogname'], 'children':[]})
            brd['children'].append(mm)
            dd = {'id': -(breed['id']*10 + 4), 'label':'Папы','children':[]}
            sqlstr = "SELECT DISTINCT dad FROM dogs WHERE breed LIKE ? AND dad != ''" 
            dads = db.execute( sqlstr, (breed['id'],)).fetchall()
            for dad in dads:
                sqlstr = "SELECT id, dogname FROM dogs WHERE id = ?"
                da = db.execute( sqlstr, (dad['dad'],)).fetchone()
                dd['children'].append({'id':da['id'], 'label':da['dogname'],'children':[]})
            brd['children'].append(dd)
            tree['children'].append(brd)

        print(f"{tree['id']} {tree['label']}")
        for brd in tree['children']:
            print(f"{brd['id']} {brd['label']}")
            for ttl in brd['children']:
                print(f"{ttl['id']} {ttl['label']}")
                for dogs in ttl['children']:
                    print(f"{dogs['id']} {dogs['label']}")

        jsn_tree = json.dumps(tree)
        return render_template('main.html', tree=jsn_tree )
    
    
    return app

