from rest_framework import serializers
from .models import PundStructure, Payment


class PundStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PundStructure
        fields = [
            "saving_amount",
            "loan_interest_percentage",
            "missed_week_penalty",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "week_number",
            "amount",
            "penalty_amount",
            "is_paid",
            "paid_at",
        ]