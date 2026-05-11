import asyncio
import websockets
async def test():
    try:
        async with websockets.connect(
            'ws://localhost:8000/api/monitoring/ws?token=test',
            extra_headers={'Origin': 'http://localhost:5173'}
        ) as ws:
            print('Connected!')
            res = await ws.recv()
            print(res)
    except Exception as e:
        print('Error:', e)
asyncio.run(test())
