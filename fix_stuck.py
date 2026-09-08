import asyncio
import os
from prisma import Prisma
from dotenv import load_dotenv

load_dotenv("backend/.env")

async def main():
    db = Prisma()
    await db.connect()
    
    # Find stuck ones
    stuck = await db.requisition.find_many(where={"status": {"in": ["Pending Evaluation", "Pending"]}})
    print(f"Found {len(stuck)} stuck requisitions. Fixing them...")
    
    for r in stuck:
        await db.requisition.update(
            where={"id": r.id},
            data={"status": "Feasible"} # Resolving to Feasible so it clears the UI
        )
        print(f"Fixed {r.id}")
        
    await db.disconnect()

asyncio.run(main())
