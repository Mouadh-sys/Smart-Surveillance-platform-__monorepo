import urllib.request
req = urllib.request.Request("http://localhost:8000/api/monitoring/ws", headers={
    "Connection": "Upgrade",
    "Upgrade": "websocket",
    "Host": "localhost:8000",
    "Origin": "http://localhost:5173",
    "Sec-WebSocket-Version": "13",
    "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ=="
})
try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
except Exception as e:
    print(e)
