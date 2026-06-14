"""
accounts/views.py — VERSION 2
Endpoints : register, login, logout, refresh, me, profile
"""

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile
from .serializers import (
    RegisterSerializer, LoginSerializer,
    UserSerializer, UserProfileSerializer,
    get_tokens_for_user,
)


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Corps : { username, email, first_name, last_name, password, password2 }
    Retourne : { user, access, refresh }  ← login automatique après inscription
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user   = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            "message": "Compte créé avec succès.",
            "user": {
                "id":         user.id,
                "username":   user.username,
                "email":      user.email,
                "first_name": user.first_name,
                "last_name":  user.last_name,
                "is_staff":   user.is_staff,
            },
            "access":  tokens['access'],
            "refresh": tokens['refresh'],
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Corps : { username, password }
    Retourne : { access, refresh, user_id, username, email, is_staff }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user   = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)

        return Response({
            "access":   tokens['access'],
            "refresh":  tokens['refresh'],
            "user_id":  user.id,
            "username": user.username,
            "email":    user.email,
            "is_staff": user.is_staff,
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Corps : { refresh: "..." }
    Blackliste le refresh token → il ne pourra plus être utilisé.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {"error": "Le champ 'refresh' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()   # ← met le token en liste noire
            return Response({"message": "Déconnexion réussie."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response(
                {"error": "Token invalide ou déjà expiré."},
                status=status.HTTP_400_BAD_REQUEST
            )


class MeView(APIView):
    """
    GET /api/auth/me/
    Retourne les infos complètes de l'utilisateur connecté.
    Nécessite : Authorization: Bearer <access_token>
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ProfileView(APIView):
    """
    GET /api/profile/  → profil utilisateur connecté
    PUT /api/profile/  → modifier phone / address / avatar
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        # S'assurer que le profil existe (sécurité)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

