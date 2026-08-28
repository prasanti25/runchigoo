import os
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()
from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()
email = 'delivery@example.com'
password = 'Password123!'
role = 'delivery'
user = User.objects.filter(email__iexact=email).first()
if not user:
    user = User.objects.create_user(email=email, password=password, role=role, first_name='Delivery', last_name='User')
    print('Created test user:', email)
else:
    print('Existing test user:', email)
    user.set_password(password)
    user.save()

client = Client(HTTP_HOST='localhost')
response = client.post('/api/v1/auth/login/', {'email': email, 'password': password, 'role': role})
print('Status code:', response.status_code)
try:
    data = json.loads(response.content.decode())
except Exception as exc:
    data = {'error': str(exc), 'raw': response.content.decode()}
print('Response:')
print(json.dumps(data, indent=2))
