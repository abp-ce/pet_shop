import os
import json
from flask import Flask, render_template, request
from flask_cors import CORS
#from .db import get_db
from .defs import get_tree, get_details, to_register, to_login, to_logout, to_load_logged_in_user

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    CORS(app, supports_credentials=True)
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

    @app.route('/details', methods=['POST'])
    def details():
        data = request.get_json()
        return json.dumps(get_details(data['id']))


    @app.route('/')
    def pet_shop():
        jsn_tree = json.dumps(get_tree('static/photo.jpeg','static/folder.png','label'))
        return render_template('main.html', tree=jsn_tree )
    
    @app.route('/tree')
    def tree():
        return json.dumps(get_tree('/photo.jpeg','/folder.png','name'))
    
    @app.route('/login', methods=('GET', 'POST'))
    def login():
        data = request.get_json()
        return json.dumps(to_login(data['username'],data['password']))
    
    @app.route('/register', methods=('GET', 'POST'))
    def register():
        data = request.get_json()
        return json.dumps(to_register(data['username'],data['password']))

    @app.route('/logout')
    def logout():
        return to_logout()

    @app.before_request
    def load_logged_in_user():
        to_load_logged_in_user()


    
    return app

