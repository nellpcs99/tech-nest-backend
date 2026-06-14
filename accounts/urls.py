"""
accounts/urls.py — VERSION 2
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, MeView, ProfileView

urlpatterns = [
    # Authentification
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/',    LoginView.as_view(),    name='login'),
    path('auth/logout/',   LogoutView.as_view(),   name='logout'),
    path('auth/refresh/',  TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/',       MeView.as_view(),       name='me'),

    # Profil
    path('profile/',       ProfileView.as_view(),  name='profile'),
]

