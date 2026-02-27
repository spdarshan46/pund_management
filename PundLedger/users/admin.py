from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):

    list_display = (
        "email",
        "name",
        "mobile",
        "is_active",
        "is_staff",
        "email_verified",
        "created_at",
    )

    list_filter = ("is_active", "is_staff", "email_verified")
    search_fields = ("email", "name", "mobile")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name", "mobile")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Verification", {"fields": ("email_verified",)}),
        ("Important Dates", {"fields": ("last_login", "created_at")}),
    )

    readonly_fields = ("created_at",)