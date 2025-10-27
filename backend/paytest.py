import requests
response = requests.get(
    "https://api.paystack.co/transaction/verify/123",
    headers={"Authorization": "Bearer sk_test_e9272d1a6403a93da80debacfd88225455f67b70"}
)
print(response.status_code, response.json())