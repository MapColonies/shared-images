FROM python:3.11-slim

# Install dependencies
RUN apt-get update && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python script
COPY scaler.py /app/scaler.py

# Make the script executable
RUN chmod +x /app/scaler.py

# Set the entrypoint
ENTRYPOINT ["python3", "/app/scaler.py"]
