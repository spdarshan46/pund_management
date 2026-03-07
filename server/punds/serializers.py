from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Membership, Pund

User = get_user_model()


class CreatePundSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Pund
        fields = ["name", "pund_type"]
    def validate_name(self, value):
        if Pund.objects.filter(name=value).exists():
            raise serializers.ValidationError("Pund with this name already exists.")
        return value


class AddMemberSerializer(serializers.Serializer):
    name   = serializers.CharField()
    email  = serializers.EmailField()
    mobile = serializers.CharField()


class PundListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model  = Pund
        fields = ["id", "name", "pund_type", "start_date", "role"]

    def get_role(self, obj):
        user = self.context["request"].user
        return Membership.objects.get(user=user, pund=obj).role