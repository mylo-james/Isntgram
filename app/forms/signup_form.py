from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, ValidationError, EqualTo, Email
from app.models import User


def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user:
        raise ValidationError("Username is already in use.")


class SignUpForm(FlaskForm):
    username = StringField("username", validators=[DataRequired(), username_exists])
    email = StringField("email", validators=[DataRequired(), Email])
    fullName = StringField("firstName", validators=[DataRequired()])
    password = StringField(
        "password",
        validators=[
            DataRequired(),
            EqualTo("confirmPassword", message="passwords must match"),
        ],
    )
    confirmPassword = StringField(
        "confirmPassword",
        validators=[],
    )
