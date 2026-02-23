"""
Prisma client singleton for database operations.
"""
from prisma import Prisma

# Global Prisma client instance
prisma_client: Prisma | None = None


async def get_prisma() -> Prisma:
    """Get or create Prisma client instance."""
    global prisma_client
    if prisma_client is None:
        prisma_client = Prisma()
    if not prisma_client.is_connected():
        await prisma_client.connect()
    return prisma_client


async def disconnect_prisma():
    """Disconnect Prisma client."""
    global prisma_client
    if prisma_client is not None and prisma_client.is_connected():
        await prisma_client.disconnect()
