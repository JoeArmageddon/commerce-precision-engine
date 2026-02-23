# Use Python 3.11
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/ .

# Install dependencies (using deploy-friendly requirements)
RUN pip install --no-cache-dir -r requirements-deploy.txt

# Generate Prisma client
RUN prisma generate

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "src.main_standalone:app", "--host", "0.0.0.0", "--port", "8000"]
