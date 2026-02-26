from django.contrib import admin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    """Admin for custom User model."""
    list_display = (
        "id",
        "email",
        "name",
        "mobile",
        "is_active",
        "email_verified",
        "is_staff",
        "created_at",
    )
    list_filter = ("is_active", "is_staff", "email_verified", "created_at")
    search_fields = ("email", "name", "mobile")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "otp_created_at")
    fieldsets = (
        (None, {"fields": ("email", "name", "mobile", "password")}),
        ("Permissions", {"fields": ("is_active", "email_verified", "is_staff", "is_superuser", "groups")}),
        ("OTP / Meta", {"fields": ("otp", "otp_created_at", "otp_attempts", "created_at")}),
    )
    autocomplete_fields = ("groups",)