FROM python:3.11-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt /app/requirements.txt

# Copy the Python script
COPY scaler.py /app/scaler.py

# Install pip deps, make script executable, create user, and set permissions
RUN pip install --no-cache-dir -r requirements.txt && \
    chmod +x /app/scaler.py && \
    useradd -m appuser && \
    chown -R appuser:appuser /app

USER appuser

# Set the entrypoint
ENTRYPOINT ["python3", "/app/scaler.py"]
