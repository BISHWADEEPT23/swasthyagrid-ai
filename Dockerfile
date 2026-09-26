FROM python:3.12-slim

# Prevent Python from writing .pyc files and buffer output
ENV PYTHONUNBUFFERED=1 \
    PORT=8080

# Set application working directory
WORKDIR /app

# Copy dependencies first for efficient caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose default port for documentation
EXPOSE 8080

# Start existing server.py
CMD ["python", "server.py"]
