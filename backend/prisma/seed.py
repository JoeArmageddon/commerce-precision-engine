"""
Seed script for CBSE Class 12 Commerce subjects and chapters.
Run: python prisma/seed.py
"""
import asyncio
import os
from prisma import Prisma

# CBSE Class 12 Commerce Data
CBSE_DATA = {
    "Accountancy": {
        "code": "ACC",
        "description": "CBSE Class 12 Accountancy - Financial Statements, Partnership, Company Accounts",
        "chapters": [
            "Accounting for Partnership: Basic Concepts",
            "Reconstitution of a Partnership Firm – Admission of a Partner",
            "Reconstitution of a Partnership Firm – Retirement/Death of a Partner",
            "Dissolution of Partnership Firm",
            "Accounting for Share Capital",
            "Issue and Redemption of Debentures",
            "Financial Statements of a Company",
            "Analysis of Financial Statements",
            "Accounting Ratios",
            "Cash Flow Statement",
        ]
    },
    "Economics": {
        "code": "ECO",
        "description": "CBSE Class 12 Economics - Micro and Macroeconomics",
        "chapters": [
            "Introduction to Microeconomics",
            "Theory of Consumer Behaviour",
            "Production and Costs",
            "The Theory of the Firm under Perfect Competition",
            "Market Equilibrium",
            "Non-competitive Markets",
            "Introduction to Macroeconomics",
            "National Income Accounting",
            "Money and Banking",
            "Income Determination",
        ]
    },
    "Business Studies": {
        "code": "BST",
        "description": "CBSE Class 12 Business Studies - Principles and Functions of Management",
        "chapters": [
            "Nature and Significance of Management",
            "Principles of Management",
            "Business Environment",
            "Planning",
            "Organising",
            "Staffing",
            "Directing",
            "Controlling",
            "Financial Management",
            "Marketing Management",
        ]
    }
}


async def seed_database():
    """Seed the database with CBSE Class 12 Commerce data."""
    prisma = Prisma()
    await prisma.connect()
    
    try:
        print("🌱 Seeding database...")
        
        for subject_name, data in CBSE_DATA.items():
            # Check if subject already exists
            existing = await prisma.subject.find_unique(
                where={"name": subject_name}
            )
            
            if existing:
                print(f"  ⏭️  Subject '{subject_name}' already exists, skipping...")
                continue
            
            # Create subject
            subject = await prisma.subject.create(
                data={
                    "name": subject_name,
                    "code": data["code"],
                    "description": data["description"],
                }
            )
            print(f"  ✅ Created subject: {subject_name} ({data['code']})")
            
            # Create chapters
            for idx, chapter_name in enumerate(data["chapters"], 1):
                await prisma.chapter.create(
                    data={
                        "name": chapter_name,
                        "displayOrder": idx,
                        "subjectId": subject.id,
                    }
                )
                print(f"     📚 Chapter {idx}: {chapter_name}")
        
        print("\n✨ Seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        raise
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(seed_database())
