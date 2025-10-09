from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, Email, ValidationError
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import logging
import json
import google.generativeai as genai
import PIL.Image
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

# Myanmar timezone (UTC+6:30)
from datetime import timezone, timedelta
MYANMAR_TZ = timezone(timedelta(hours=6, minutes=30))

def get_myanmar_time():
    """Get current time in Myanmar timezone"""
    return datetime.now(MYANMAR_TZ)

def to_myanmar_time(utc_datetime):
    """Convert UTC datetime to Myanmar timezone"""
    if utc_datetime is None:
        return None
    if utc_datetime.tzinfo is None:
        utc_datetime = utc_datetime.replace(tzinfo=timezone.utc)
    return utc_datetime.astimezone(MYANMAR_TZ)

app = Flask(__name__)
project_folder = os.path.dirname(os.path.abspath(__file__))

# Configure for PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

# If no DATABASE_URL, construct from individual components
if not DATABASE_URL:
    USER = os.getenv("user")
    PASSWORD = os.getenv("password")
    HOST = os.getenv("host")
    PORT = os.getenv("port")
    DBNAME = os.getenv("dbname")
    
    if all([USER, PASSWORD, HOST, PORT, DBNAME]):
        DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require&connect_timeout=10&application_name=gemini-facebook-scheduler"
        logging.info("Using Supabase PostgreSQL database")
    else:
        raise ValueError("Database configuration missing. Please set DATABASE_URL or individual database environment variables.")
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure upload folder for different environments
if os.getenv('VERCEL'):
    # In Vercel serverless environment, use /tmp directory
    UPLOAD_FOLDER = '/tmp/uploads'
else:
    # In local development, use uploads folder in project directory
    UPLOAD_FOLDER = os.path.join(project_folder, 'uploads')

# Create upload folder (only works in writable environments)
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except OSError:
    # If we can't create the folder, log it but don't crash (serverless environment)
    logging.warning(f"Could not create upload folder: {UPLOAD_FOLDER}")
    pass

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "a-very-secret-key-for-development")
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['WTF_CSRF_ENABLED'] = True
app.config['FAVICON_VERSION'] = '3.0'  # Increment this to force favicon refresh

# Database connection pool settings for better reliability
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 120,  # Recycle connections every 2 minutes
    'pool_pre_ping': True,  # Validate connections before use
    'pool_timeout': 20,
    'max_overflow': 0
}

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    api_key = db.Column(db.Text, nullable=True)  # Store user's Gemini API key
    password_hash = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    failed_login_attempts = db.Column(db.Integer, default=0, nullable=False)
    last_failed_login = db.Column(db.DateTime, nullable=True)
    locked_until = db.Column(db.DateTime, nullable=True)
    contents = db.relationship('Content', backref='author', lazy=True, cascade='all, delete-orphan')
    
    def is_account_locked(self):
        """Check if account is currently locked"""
        if self.locked_until:
            # Convert locked_until to Myanmar time for comparison
            current_time = get_myanmar_time()
            if self.locked_until.tzinfo is None:
                # If locked_until is naive (UTC), make it timezone aware
                locked_until_utc = self.locked_until.replace(tzinfo=timezone.utc)
                locked_until_myanmar = locked_until_utc.astimezone(MYANMAR_TZ)
            else:
                locked_until_myanmar = self.locked_until.astimezone(MYANMAR_TZ)
            
            return locked_until_myanmar > current_time
        return False
    
    def record_failed_login(self):
        """Record a failed login attempt"""
        self.failed_login_attempts += 1
        self.last_failed_login = datetime.now(timezone.utc)
        
        # Lock account after 3 failed attempts
        if self.failed_login_attempts >= 3:
            self.is_active = False
            # Set lock time in UTC but calculate 30 minutes from Myanmar time
            myanmar_now = get_myanmar_time()
            myanmar_lock_until = myanmar_now + timedelta(minutes=30)
            self.locked_until = myanmar_lock_until.astimezone(timezone.utc).replace(tzinfo=None)
        
        db.session.commit()
    
    def reset_failed_attempts(self):
        """Reset failed login attempts after successful login"""
        self.failed_login_attempts = 0
        self.last_failed_login = None
        self.locked_until = None
        db.session.commit()
    
    def get_locked_until_myanmar(self):
        """Get locked_until time in Myanmar timezone for display"""
        if self.locked_until:
            if self.locked_until.tzinfo is None:
                # Assume UTC if no timezone info
                locked_until_utc = self.locked_until.replace(tzinfo=timezone.utc)
                return locked_until_utc.astimezone(MYANMAR_TZ)
            else:
                return self.locked_until.astimezone(MYANMAR_TZ)
        return None

class Content(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    purpose = db.Column(db.Text, nullable=True)
    writing_style = db.Column(db.String(100), nullable=True)
    audience = db.Column(db.Text, nullable=True)
    keywords = db.Column(db.Text, nullable=True)
    hashtags = db.Column(db.Text, nullable=True)
    cta = db.Column(db.Text, nullable=True)
    negative_constraints = db.Column(db.Text, nullable=True)
    reference_links = db.Column(db.Text, nullable=True)  # Store as JSON string
    image_path = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

@login_manager.user_loader
def load_user(user_id):
    try:
        return db.session.get(User, int(user_id))
    except Exception as e:
        logging.error(f"Error loading user {user_id}: {e}")
        # Try to rollback and retry once
        try:
            db.session.rollback()
            return db.session.get(User, int(user_id))
        except Exception as retry_error:
            logging.error(f"Retry failed for user {user_id}: {retry_error}")
            return None

# Custom validator for Gmail addresses
def validate_gmail(form, field):
    if not field.data.lower().endswith('@gmail.com'):
        raise ValidationError('Please use a Gmail address (@gmail.com)')

# Custom validator for password (no spaces)
def validate_password_no_spaces(form, field):
    if ' ' in field.data:
        raise ValidationError('Password cannot contain spaces')

# Forms
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), validate_gmail])
    password = PasswordField('Password', validators=[DataRequired(), validate_password_no_spaces], render_kw={"placeholder": "Enter your password"})
    api_key = StringField('Gemini API Key', render_kw={"placeholder": "Enter your Gemini API Key"})
    submit = SubmitField('Login')

class AdminLoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), validate_gmail])
    password = PasswordField('Password', validators=[DataRequired(), validate_password_no_spaces], render_kw={"placeholder": "Enter your password"})
    submit = SubmitField('Admin Login')

class UserForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), validate_gmail])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6), validate_password_no_spaces], render_kw={"placeholder": "Enter password (minimum 6 characters)"})
    is_admin = SelectField('Role', choices=[('False', 'User'), ('True', 'Admin')], default='False')
    submit = SubmitField('Create User')


# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Database error handling decorator
def handle_db_errors(f):
    """Decorator to handle database connection errors"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logging.error(f"Database error in {f.__name__}: {e}")
            
            # Check if it's a connection error
            if 'server closed the connection unexpectedly' in str(e) or 'connection' in str(e).lower():
                try:
                    # Try to rollback and close the session
                    db.session.rollback()
                    db.session.close()
                    
                    # Retry the function once
                    logging.info(f"Retrying {f.__name__} after connection error")
                    return f(*args, **kwargs)
                except Exception as retry_error:
                    logging.error(f"Retry failed for {f.__name__}: {retry_error}")
                    flash('Database connection error. Please try again.', 'error')
                    return redirect(url_for('login'))
            else:
                # For other database errors, rollback and re-raise
                db.session.rollback()
                raise e
    
    return decorated_function

@app.context_processor
def inject_now():
    return {
        'now': datetime.now(timezone.utc),
        'myanmar_now': get_myanmar_time()
    }

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    logging.info("Gemini API configured successfully")
else:
    logging.warning("GEMINI_API_KEY not found in environment variables")
    model = None

# Global error handlers
@app.errorhandler(Exception)
def handle_exception(e):
    """Handle uncaught exceptions"""
    # Check if it's a database connection error
    if 'server closed the connection unexpectedly' in str(e) or 'OperationalError' in str(type(e).__name__):
        logging.error(f"Database connection error: {e}")
        try:
            db.session.rollback()
            db.session.close()
        except:
            pass
        flash('Database connection lost. Please try logging in again.', 'error')
        return redirect(url_for('login'))
    
    # For other exceptions, log and show generic error
    logging.error(f"Unhandled exception: {e}")
    flash('An unexpected error occurred. Please try again.', 'error')
    return redirect(url_for('index'))

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        # Pass along any URL parameters for toast notifications
        login_success = request.args.get('login_success')
        username = request.args.get('username')
        
        if current_user.is_admin:
            if login_success and username:
                return redirect(url_for('admin_dashboard', login_success=login_success, username=username))
            else:
                return redirect(url_for('admin_dashboard'))
        else:
            if login_success and username:
                return redirect(url_for('user_dashboard', login_success=login_success, username=username))
            else:
                return redirect(url_for('user_dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
@handle_db_errors
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower()).first()
        
        if user:
            # Check if account is locked
            if user.is_account_locked():
                flash('Account is temporarily locked due to multiple failed login attempts. Please try again later.', 'error')
                return redirect(url_for('login', login_error='true', message='Account is temporarily locked due to multiple failed login attempts'))
            
            # Check if account is deactivated
            if not user.is_active:
                flash('Your account has been deactivated. Please contact an administrator.', 'error')
                return redirect(url_for('login', login_error='true', message='Your account has been deactivated. Please contact an administrator'))
            
            # Check password
            if bcrypt.check_password_hash(user.password_hash, form.password.data):
                # Redirect admins to admin login
                if user.is_admin:
                    flash('Please use admin login for administrative access.', 'info')
                    return redirect(url_for('admin_login'))
                
                # Successful login - reset failed attempts and store API key
                user.reset_failed_attempts()
                
                # API key is required for regular users
                if not form.api_key.data:
                    flash('API key is required for regular users', 'error')
                    return redirect(url_for('login', login_error='true', message='API key is required for regular users'))
                
                # Store API key
                user.api_key = form.api_key.data
                db.session.commit()
                
                login_user(user, remember=True)
                flash(f'Welcome back, {user.email}!', 'success')
                # Add URL parameter for toast notification
                return redirect(url_for('index', login_success='true', username=user.email))
            else:
                # Failed password - record attempt
                user.record_failed_login()
                remaining_attempts = 3 - user.failed_login_attempts
                
                if user.failed_login_attempts >= 3:
                    flash('Account deactivated due to 3 failed login attempts. Please contact an administrator.', 'error')
                    return redirect(url_for('login', login_error='true', message='Account deactivated due to 3 failed login attempts'))
                else:
                    flash(f'Invalid password. {remaining_attempts} attempts remaining before account deactivation.', 'error')
                    return redirect(url_for('login', login_error='true', message=f'Invalid password. {remaining_attempts} attempts remaining'))
        else:
            flash('Invalid email or password', 'error')
            return redirect(url_for('login', login_error='true', message='Invalid email or password'))
    
    return render_template('login.html', form=form)

@app.route('/admin/login', methods=['GET', 'POST'])
@handle_db_errors
def admin_login():
    if current_user.is_authenticated:
        if current_user.is_admin:
            return redirect(url_for('admin_dashboard'))
        else:
            return redirect(url_for('user_dashboard'))
    
    form = AdminLoginForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower()).first()
        
        if user:
            # Check if account is locked
            if user.is_account_locked():
                flash('Account is temporarily locked due to multiple failed login attempts. Please try again later.', 'error')
                return redirect(url_for('admin_login', login_error='true', message='Account is temporarily locked due to multiple failed login attempts'))
            
            # Check if account is deactivated
            if not user.is_active:
                flash('Your account has been deactivated. Please contact an administrator.', 'error')
                return redirect(url_for('admin_login', login_error='true', message='Your account has been deactivated. Please contact an administrator'))
            
            # Only allow admin users
            if not user.is_admin:
                flash('Access denied. Admin privileges required.', 'error')
                return redirect(url_for('admin_login', login_error='true', message='Access denied. Admin privileges required'))
            
            # Check password
            if bcrypt.check_password_hash(user.password_hash, form.password.data):
                # Successful login - reset failed attempts
                user.reset_failed_attempts()
                db.session.commit()
                
                login_user(user, remember=True)
                flash(f'Welcome back, Admin {user.email}!', 'success')
                return redirect(url_for('admin_dashboard', login_success='true', username=user.email))
            else:
                # Failed password - record attempt
                user.record_failed_login()
                remaining_attempts = 3 - user.failed_login_attempts
                
                if user.failed_login_attempts >= 3:
                    flash('Account deactivated due to 3 failed login attempts. Please contact an administrator.', 'error')
                    return redirect(url_for('admin_login', login_error='true', message='Account deactivated due to 3 failed login attempts'))
                else:
                    flash(f'Invalid password. {remaining_attempts} attempts remaining before account deactivation.', 'error')
                    return redirect(url_for('admin_login', login_error='true', message=f'Invalid password. {remaining_attempts} attempts remaining'))
        else:
            flash('Invalid email or password', 'error')
            return redirect(url_for('admin_login', login_error='true', message='Invalid email or password'))
    
    return render_template('admin_login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    user_email = current_user.email
    logout_user()
    flash(f'Goodbye {user_email}! You have been logged out successfully.', 'success')
    # Add URL parameter for toast notification
    return redirect(url_for('login', logout_success='true', username=user_email))

@app.route('/admin')
@login_required
@handle_db_errors
def admin_dashboard():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('user_dashboard'))
    
    # Get search and filter parameters
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    filter_status = request.args.get('filter', '', type=str)
    
    # Build query with search and filter
    query = User.query
    
    if search:
        query = query.filter(User.email.contains(search))
    
    if filter_status == 'active':
        query = query.filter(User.is_active == True)
    elif filter_status == 'inactive':
        query = query.filter(User.is_active == False)
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    
    total_users = User.query.count()
    total_contents = Content.query.count()
    recent_contents = Content.query.order_by(Content.created_at.desc()).limit(3).all()
    
    return render_template('admin_dashboard.html', 
                         users=users, 
                         total_users=total_users,
                         total_contents=total_contents,
                         recent_contents=recent_contents,
                         search=search,
                         filter_status=filter_status)

@app.route('/admin/users/create', methods=['GET', 'POST'])
@login_required
def create_user():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'error')
        return redirect(url_for('user_dashboard'))
    
    form = UserForm()
    if form.validate_on_submit():
        # Check if email already exists (case-insensitive)
        existing_email = User.query.filter_by(email=form.email.data.lower()).first()
        
        if existing_email:
            flash('Email already exists', 'error')
            return redirect(url_for('create_user', user_error='true', message='Email already exists'))
        else:
            password_hash = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
            user = User(
                email=form.email.data.lower(),
                password_hash=password_hash,
                is_admin=(form.is_admin.data == 'True')
            )
            db.session.add(user)
            db.session.commit()
            flash(f'User {form.email.data} created successfully', 'success')
            # Add URL parameter for toast notification
            return redirect(url_for('admin_dashboard', user_created='true', username=form.email.data))
    
    return render_template('create_user.html', form=form)

@app.route('/admin/users/<int:user_id>/toggle', methods=['POST'])
@login_required
def toggle_user_status(user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot modify your own status'}), 400
    
    try:
        old_status = user.is_active
        user.is_active = not user.is_active
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        print(f"User {user.email} (ID: {user_id}) {status} by admin {current_user.email}")
        
        return jsonify({
            'success': True, 
            'message': f'User {user.email} {status} successfully',
            'new_status': user.is_active
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error toggling user status: {e}")
        return jsonify({'error': 'Database error occurred'}), 500

@app.route('/admin/users/<int:user_id>/reset-attempts', methods=['POST'])
@login_required
def reset_user_attempts(user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        old_attempts = user.failed_login_attempts
        user.reset_failed_attempts()
        
        # If user was deactivated due to failed attempts, reactivate them
        if not user.is_active and user.locked_until:
            user.is_active = True
            db.session.commit()
        
        print(f"Admin {current_user.email} reset failed attempts for user {user.email} (was: {old_attempts})")
        
        return jsonify({
            'success': True, 
            'message': f'Failed login attempts reset for {user.email}',
            'was_reactivated': not user.is_active and user.locked_until is not None
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error resetting user attempts: {e}")
        return jsonify({'error': 'Database error occurred'}), 500

@app.route('/admin/users/<int:user_id>/delete', methods=['DELETE'])
@login_required
def delete_user(user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Access denied'}), 403
    
    user = db.session.get(User, user_id)
    if user and user.id != current_user.id:  # Can't delete self
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User deleted successfully'})
    
    return jsonify({'error': 'User not found or cannot delete self'}), 400

@app.route('/dashboard')
@login_required
@handle_db_errors
def content_history():
    if current_user.is_admin:
        return redirect(url_for('admin_dashboard'))
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '', type=str)
    
    # Build query with search
    query = Content.query.filter_by(user_id=current_user.id)
    
    if search:
        query = query.filter(
            db.or_(
                Content.title.contains(search),
                Content.content.contains(search),
                Content.purpose.contains(search)
            )
        )
    
    contents = query.order_by(Content.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    
    return render_template('content_history.html', contents=contents, search=search)

@app.route('/contents')
@login_required
@handle_db_errors
def user_dashboard():
    if current_user.is_admin:
        return redirect(url_for('admin_dashboard'))
    
    recent_contents = Content.query.filter_by(user_id=current_user.id).order_by(Content.created_at.desc()).limit(3).all()
    total_contents = Content.query.filter_by(user_id=current_user.id).count()
    
    return render_template('user_dashboard.html', 
                         recent_contents=recent_contents,
                         total_contents=total_contents)

@app.route('/contents/save', methods=['POST'])
@login_required
@handle_db_errors
def save_content():
    """Save AI-generated content directly"""
    try:
        title = request.form.get('title')
        content_text = request.form.get('content')
        purpose = request.form.get('purpose', '')
        writing_style = request.form.get('writing_style', '')
        audience = request.form.get('audience', '')
        keywords = request.form.get('keywords', '')
        hashtags = request.form.get('hashtags', '')
        cta = request.form.get('cta', '')
        negative_constraints = request.form.get('negative_constraints', '')
        reference_links = request.form.get('reference_links', '[]')
        
        if not title or not content_text:
            return jsonify({'error': 'Title and content are required'}), 400
        
        content = Content(
            user_id=current_user.id,
            title=title,
            content=content_text,
            purpose=purpose,
            writing_style=writing_style,
            audience=audience,
            keywords=keywords,
            hashtags=hashtags,
            cta=cta,
            negative_constraints=negative_constraints,
            reference_links=reference_links
        )
        db.session.add(content)
        db.session.commit()
        
        # Return content data for frontend update
        content_data = {
            'id': content.id,
            'title': content.title,
            'content': content.content,
            'purpose': content.purpose,
            'created_at': content.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return jsonify({
            'success': True, 
            'message': 'Content saved successfully',
            'content': content_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/contents/<int:content_id>')
@login_required
def view_content(content_id):
    content = db.session.get(Content, content_id)
    if not content or content.user_id != current_user.id:
        flash('Content not found', 'error')
        return redirect(url_for('content_history'))
    
    return render_template('view_content.html', content=content)

@app.route('/contents/<int:content_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_content(content_id):
    content = db.session.get(Content, content_id)
    if not content or content.user_id != current_user.id:
        flash('Content not found', 'error')
        return redirect(url_for('content_history'))
    
    if request.method == 'POST':
        content.title = request.form.get('title', content.title)
        content.content = request.form.get('content', content.content)
        content.purpose = request.form.get('purpose', content.purpose)
        content.writing_style = request.form.get('writing_style', content.writing_style)
        content.audience = request.form.get('audience', content.audience)
        content.keywords = request.form.get('keywords', content.keywords)
        content.hashtags = request.form.get('hashtags', content.hashtags)
        content.cta = request.form.get('cta', content.cta)
        content.negative_constraints = request.form.get('negative_constraints', content.negative_constraints)
        content.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash('Content updated successfully', 'success')
        return redirect(url_for('view_content', content_id=content.id))
    
    return render_template('edit_content.html', content=content)

@app.route('/contents/<int:content_id>/delete', methods=['DELETE'])
@login_required
def delete_content(content_id):
    content = db.session.get(Content, content_id)
    if not content or content.user_id != current_user.id:
        return jsonify({'error': 'Content not found'}), 404
    
    # Delete associated image file if exists
    if content.image_path and os.path.exists(content.image_path):
        try:
            os.remove(content.image_path)
        except Exception:
            pass
    
    db.session.delete(content)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Content deleted successfully'})

@app.route('/generate-content', methods=['POST'])
@login_required
def generate_content():
    try:
        logging.info("Generate content request received")
        # Check if user has API key (required for content generation)
        if not current_user.api_key:
            if current_user.is_admin:
                logging.error("Admin user has no API key configured")
                return jsonify({'error': 'Admin users need to provide a Gemini API key to generate content. Please update your profile or login again with an API key.'}), 400
            else:
                logging.error("User has no API key configured")
                return jsonify({'error': 'Please login with your Gemini API key to generate content.'}), 400
        
        # Configure Gemini with user's API key
        try:
            genai.configure(api_key=current_user.api_key)
            user_model = genai.GenerativeModel('gemini-2.5-flash')
            logging.info("User's Gemini API configured successfully")
        except Exception as api_error:
            logging.error(f"Error configuring user's API key: {api_error}")
            return jsonify({'error': 'Invalid API key. Please check your Gemini API key.'}), 400
        # request.form is used for multipart/form-data
        data = request.form
        page_name = data.get('pageName', '')
        prompt = data.get('prompt', '')
        purpose = data.get('purpose', '')
        
        # Validate required fields
        if not page_name.strip():
            return jsonify({'error': 'Page Name လိုအပ်ပါတယ်။ Facebook Page သို့မဟုတ် Brand အမည် ထည့်ပါ။'}), 400
        
        if not prompt.strip():
            return jsonify({'error': 'Topic လိုအပ်ပါတယ်။ Content ၏ အဓိက အကြောင်းအရာ ထည့်ပါ။'}), 400
        writing_style = data.get('writingStyle', '')
        audience = data.get('audience', '')
        word_count = data.get('wordCount', '')
        keywords = data.get('keywords', '')
        hashtags = data.get('hashtags', '')
        cta = data.get('cta', '')
        negative_constraints = data.get('negativeConstraints', '')
        copywriting_model = data.get('copywritingModel', 'none')
        language = data.get('language', 'myanmar')
        
        # Get reference links
        reference_links_json = data.get('referenceLinks', '[]')
        try:
            reference_links = json.loads(reference_links_json) if reference_links_json else []
        except:
            reference_links = []
        
        # Get emoji toggle state
        include_emojis = data.get('includeEmojis', 'true').lower() == 'true'

        model_instructions = {
            'AIDA': "using the AIDA (Attention, Interest, Desire, Action) framework",
            'PAS': "using the PAS (Problem, Agitate, Solution) framework",
            'FAB': "using the FAB (Features, Advantages, Benefits) framework",
            '4Ps': "using the 4 P's (Picture, Promise, Prove, Push) framework",
            'BAB': "using the BAB (Before, After, Bridge) framework",
            'none': ""
        }
        
        model_instruction = model_instructions.get(copywriting_model, "")
        
        # Set language instruction
        language_instructions = {
            'myanmar': "The response must be in the Burmese (Myanmar) language.",
            'english': "The response must be in English."
        }
        language_instruction = language_instructions.get(language, "The response must be in the Burmese (Myanmar) language.")

        # Construct reference links section
        reference_section = ""
        if reference_links:
            reference_section = f"\nReference Links (use these as inspiration and reference):\n"
            for i, link in enumerate(reference_links, 1):
                reference_section += f"{i}. {link}\n"
            reference_section += "\nPlease use the information from these links as reference to create more relevant and informed content."

        # Construct emoji instruction based on toggle and word count
        emoji_instruction = ""
        if include_emojis:
            # Dynamic emoji count based on word count
            word_count_int = int(word_count) if word_count.isdigit() else 300
            if word_count_int <= 100:
                emoji_count = "1-2"
            elif word_count_int <= 200:
                emoji_count = "2-4"
            else:
                emoji_count = "3-6"
            
            emoji_instruction = f"\n\nIMPORTANT: Include appropriate emojis naturally throughout the content to make it more engaging and visually appealing. Use emojis that are relevant to the topic and context, but don't overuse them - aim for {emoji_count} well-placed emojis for this {word_count_int}-word post."
        else:
            emoji_instruction = "\n\nIMPORTANT: Do NOT include any emojis in the content. Generate clean text content without any emoji symbols."

        # Construct a more detailed prompt
        enhanced_prompt = f"""You are a 10 years experience social media content writer. Directly generate a social media post {model_instruction}. Do not include any introductory phrases, explanations, or preambles. {language_instruction}{emoji_instruction}
        
        Topic: {prompt}
        Purpose: {purpose}
        Writing Style: {writing_style}
        Target Audience: {audience}
        Word Count: Approximately {word_count} words
        Keywords to include: {keywords}
        Hashtags to include: {hashtags}
        Call to Action: {cta}
        Avoid/Don't include: {negative_constraints}{reference_section}
        """
        
        # Check for an uploaded image
        image_file = request.files.get('image')
        logging.info(f"Request files: {list(request.files.keys())}")
        logging.info(f"Image file: {image_file}, filename: {image_file.filename if image_file else 'None'}")
        
        if image_file and image_file.filename:
            # Check file size (limit to 4MB for better compatibility)
            image_file.stream.seek(0, 2)  # Seek to end
            file_size = image_file.stream.tell()
            image_file.stream.seek(0)  # Reset to beginning
            
            logging.info(f"Image file received: {image_file.filename}, size: {file_size} bytes")
            
            # Check if file is too large (4MB limit for better compatibility)
            if file_size > 4 * 1024 * 1024:  # 4MB
                logging.warning(f"Image file too large: {file_size} bytes")
                return jsonify({'error': f'ပုံဖိုင်က အရမ်းကြီးလွန်းပါတယ်။ 4MB ထက်နည်းတဲ့ ပုံကို သုံးပါ။ သင့်ဖိုင်က {file_size / (1024*1024):.1f}MB ရှိပါတယ်။'}), 400
            
            try:
                # Reset stream position to beginning
                image_file.stream.seek(0)
                img = PIL.Image.open(image_file.stream)
                
                # Resize image if it's too large (max 1536x1536 for better quality)
                max_size = (1536, 1536)
                if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                    logging.info(f"Resizing image from {img.size} to fit {max_size}")
                    img.thumbnail(max_size, PIL.Image.Resampling.LANCZOS)
                
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Combine the text prompt and the image for the model
                contents = [enhanced_prompt, img]
                logging.info("Sending prompt and image to Gemini.")
                response = user_model.generate_content(contents)
            except Exception as img_error:
                logging.error(f"Error processing image: {img_error}")
                # Fall back to text-only if image processing fails
                logging.info("Falling back to text-only prompt due to image error.")
                response = user_model.generate_content(enhanced_prompt)
        else:
            # If no image, proceed with text only
            logging.info("Sending text-only prompt to Gemini.")
            response = user_model.generate_content(enhanced_prompt)

        # Ensure response has text content
        if hasattr(response, 'text') and response.text:
            return jsonify({'content': response.text})
        else:
            logging.error("Gemini response has no text content")
            return jsonify({'error': 'Failed to generate content. Please try again.'}), 500
            
    except Exception as e:
        logging.error(f"Error in generate_content: {e}")
        # Ensure error response is always valid JSON
        error_message = str(e)
        if len(error_message) > 200:  # Truncate very long error messages
            error_message = error_message[:200] + "..."
        return jsonify({'error': error_message}), 500
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/favicon.ico')
def favicon():
    response = send_from_directory(os.path.join(app.root_path, 'static', 'images'), 'MOT.d21a8f07.png', mimetype='image/png')
    # Force no cache to always serve fresh favicon
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['ETag'] = f'favicon-v{app.config.get("FAVICON_VERSION", "2.0")}-{hash(str(__import__("time").time()))}'
    return response

@app.route('/test-toast')
@login_required
def test_toast():
    """Test route to generate flash messages for toast testing"""
    flash('This is a test success message!', 'success')
    flash('This is a test error message!', 'error')
    flash('This is a test warning message!', 'warning')
    return redirect(url_for('user_dashboard'))

def create_admin_user():
    """Create default admin user if none exists"""
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@gmail.com')
    admin_password = os.getenv('ADMIN_PASSWORD')
    
    if not admin_password:
        logging.warning("ADMIN_PASSWORD not set in environment variables. Skipping admin user creation.")
        return
    
    # Check if admin user already exists by email
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        password_hash = bcrypt.generate_password_hash(admin_password).decode('utf-8')
        admin = User(
            email=admin_email,
            password_hash=password_hash,
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        logging.info(f"Admin user created: email='{admin_email}'")
    else:
        logging.info(f"Admin user already exists: {admin_email}")

def reset_database():
    """Drop all tables and recreate them - USE WITH CAUTION"""
    try:
        logging.warning("RESETTING DATABASE - ALL DATA WILL BE LOST!")
        db.drop_all()
        db.create_all()
        logging.info("Database reset complete - all tables recreated")
        return True
    except Exception as e:
        logging.error(f"Error resetting database: {e}")
        return False

def migrate_database():
    """Add email and api_key columns to user table, remove username column, and update content fields"""
    try:
        with db.engine.connect() as conn:
            # Add email column to user table if it doesn't exist
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='user' AND column_name='email'
            """))
            
            if not result.fetchone():
                logging.info("Adding email column to user table...")
                conn.execute(db.text("ALTER TABLE \"user\" ADD COLUMN email VARCHAR(120) UNIQUE"))
                conn.commit()
                logging.info("Email column added successfully")
            else:
                logging.info("Email column already exists")
            
            # Add api_key column to user table if it doesn't exist
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='user' AND column_name='api_key'
            """))
            
            if not result.fetchone():
                logging.info("Adding api_key column to user table...")
                conn.execute(db.text("ALTER TABLE \"user\" ADD COLUMN api_key TEXT"))
                conn.commit()
                logging.info("API key column added successfully")
            else:
                logging.info("API key column already exists")
            
            # Remove username column if it exists (after ensuring email is populated)
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='user' AND column_name='username'
            """))
            
            if result.fetchone():
                logging.info("Removing username column from user table...")
                conn.execute(db.text("ALTER TABLE \"user\" DROP COLUMN username"))
                conn.commit()
                logging.info("Username column removed successfully")
            else:
                logging.info("Username column already removed")
            
            # Add new fields to content table if they don't exist
            # Check for cta column
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='content' AND column_name='cta'
            """))
            
            if not result.fetchone():
                logging.info("Adding cta column to content table...")
                conn.execute(db.text("ALTER TABLE content ADD COLUMN cta VARCHAR(500)"))
                conn.commit()
                logging.info("CTA column added successfully")
            
            # Check for negative_constraints column
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='content' AND column_name='negative_constraints'
            """))
            
            if not result.fetchone():
                logging.info("Adding negative_constraints column to content table...")
                conn.execute(db.text("ALTER TABLE content ADD COLUMN negative_constraints TEXT"))
                conn.commit()
                logging.info("Negative constraints column added successfully")
            
            # Check for reference_links column
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='content' AND column_name='reference_links'
            """))
            
            if not result.fetchone():
                logging.info("Adding reference_links column to content table...")
                conn.execute(db.text("ALTER TABLE content ADD COLUMN reference_links TEXT"))
                conn.commit()
                logging.info("Reference links column added successfully")
            
            # Update content table columns to TEXT for unlimited length
            logging.info("Updating content table column types to TEXT...")
            conn.execute(db.text("ALTER TABLE content ALTER COLUMN purpose TYPE TEXT"))
            conn.execute(db.text("ALTER TABLE content ALTER COLUMN audience TYPE TEXT"))
            conn.execute(db.text("ALTER TABLE content ALTER COLUMN keywords TYPE TEXT"))
            conn.execute(db.text("ALTER TABLE content ALTER COLUMN hashtags TYPE TEXT"))
            conn.execute(db.text("ALTER TABLE content ALTER COLUMN cta TYPE TEXT"))
            conn.commit()
            logging.info("Column types updated to TEXT successfully")
            
    except Exception as e:
        logging.error(f"Migration failed: {e}")
        raise e

# Initialize database function (called on first request)
def init_db():
    """Initialize database tables and admin user"""
    try:
        with app.app_context():
            db.create_all()
            migrate_database()
            create_admin_user()
            logging.info("Database tables created/updated.")
            logging.info(f"Using database: {DATABASE_URL.split('://')[0] if DATABASE_URL else 'No database URL'}")
    except Exception as e:
        logging.error(f"Database initialization failed: {e}")
        # Don't raise error in production, just log it
        pass

# Initialize database when app starts (for production)
# Only run if not in serverless environment
if not os.getenv('VERCEL'):
    init_db()

# For serverless environments, initialize on first request
# Using before_request instead of deprecated before_first_request
_db_initialized = False

@app.before_request
def initialize_database():
    """Initialize database on first request in serverless environment"""
    global _db_initialized
    if os.getenv('VERCEL') and not _db_initialized:
        init_db()
        _db_initialized = True

if __name__ == '__main__':
    app.run(debug=True)
