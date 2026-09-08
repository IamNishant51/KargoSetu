import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    reqs = await db.requisition.find_many()
    print("Total reqs:", len(reqs))
    for r in reqs[-5:]:
        print(f"[{r.id}] Status: {r.status}")
    await db.disconnect()

asyncio.run(main())
