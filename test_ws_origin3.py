import asyncio
import websockets
import json
async def test():
    try:
        async with websockets.connect(
            'ws://localhost:8000/api/monitoring/ws?token=test',
            additional_headers={'Origin': 'http://localhost:5173'}
        ) as ws:
            print('Connected!')
            res = await ws.recv()
            print(res)
            # Try to send ping
            await ws.send("ping")
            res2 = await ws.recv()
            print(res2)
    except Exception as e:
        print('Error:', e)
asyncio.run(test())
