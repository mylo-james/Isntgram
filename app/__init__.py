import os
from flask import Flask, send_from_directory, request, redirect
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Configuration
from app.routes import session, comment, profile, follow, like, post, user, notification, search, aws
from app.models import db
from flask_login import LoginManager


app = Flask(__name__)

CORS(app)
app.config.from_object(Configuration)
db.init_app(app)
migrate = Migrate(app, db)

login = LoginManager(app)
login.login_view = 'auth.unauthorized'

app.register_blueprint(session.bp, url_prefix='/api/session')
app.register_blueprint(profile.bp, url_prefix='/api/profile')
app.register_blueprint(follow.bp, url_prefix='/api/follow')
app.register_blueprint(like.bp,url_prefix='/api/like')
app.register_blueprint(post.bp,url_prefix='/api/post')
app.register_blueprint(notification.bp,url_prefix='/api/note')
app.register_blueprint(user.bp,url_prefix='/api/user')
app.register_blueprint(comment.bp,url_prefix='/api/comment')
app.register_blueprint(search.bp,url_prefix='/api/search')
app.register_blueprint(aws.bp,url_prefix='/api/aws')

@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)

@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get(
            'FLASK_ENV') == 'production' else None,
        httponly=True)
    return response


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    if path == 'favicon.ico':
        return app.send_static_file('favicon.ico')
    return app.send_static_file('index.html')
