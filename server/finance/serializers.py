from rest_framework import serializers
from .models import PundStructure, Payment


class PundStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PundStructure
        fields = [
            "saving_amount",
            "loan_interest_percentage",
            "missed_saving_penalty",
            "missed_loan_penalty",
            "default_loan_cycles",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "cycle_number",
            "amount",
            "penalty_amount",
            "is_paid",
            "paid_at",
        ]

class LoanRequestSerializer(serializers.Serializer):
    principal_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class LoanApproveSerializer(serializers.Serializer):
    cycles = serializers.IntegerField(required=False)