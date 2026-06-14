"""
accounts/serializers.py — VERSION 2
Ajouts : LoginSerializer avec tokens, RegisterSerializer retourne les tokens
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile


def get_tokens_for_user(user):
    """Génère access + refresh token pour un utilisateur donné."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class RegisterSerializer(serializers.ModelSerializer):
    """
    Inscription : crée le compte + le profil + retourne les tokens JWT.
    POST /api/auth/register/
    """
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label="Confirmer le mot de passe")

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("L'email est obligatoire.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # Créer le profil vide lié au compte
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    """
    Connexion : vérifie les credentials et retourne les tokens + infos user.
    POST /api/auth/login/
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError("Nom d'utilisateur ou mot de passe incorrect.")
        if not user.is_active:
            raise serializers.ValidationError("Ce compte est désactivé.")
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Lecture et mise à jour du profil (phone, address, avatar)."""
    class Meta:
        model  = UserProfile
        fields = ['phone', 'address', 'avatar']


class UserSerializer(serializers.ModelSerializer):
    """Retourne les infos complètes de l'utilisateur connecté + son profil."""
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile']
        read_only_fields = ['id', 'username', 'is_staff']

