FROM python:3.11-slim

# Set environment variables to prevent python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create and switch to a non-root user
RUN useradd -m -s /bin/bash aiuser
WORKDIR /app

# Install system dependencies required for building Python packages (like PyMuPDF)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Change ownership of the app directory
RUN chown -R aiuser:aiuser /app

# Switch to non-root user
USER aiuser

# Copy application code
COPY --chown=aiuser:aiuser app/ app/

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
