import requests
import json
import time

# Tunggu sebentar memastikan server sudah hidup
time.sleep(2)

url = "http://localhost:8000/predict"
payload = {
  "kondisi_rumah": 4,
  "sumber_listrik": 4,
  "kepemilikan_aset": 3,
  "pendidikan_kk": 4,
  "jml_tanggungan": 2,
  "jenis_pekerjaan": 6,
  "akses_air": 4,
  "kepemilikan_lahan": 3
}

headers = {
  'Content-Type': 'application/json'
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print("Status Code:", response.status_code)
print("Response Body:")
print(json.dumps(response.json(), indent=2))
