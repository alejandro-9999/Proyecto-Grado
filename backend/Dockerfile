# Base image
FROM python:3.11-slim


RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /backend

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app ./app

# Command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
