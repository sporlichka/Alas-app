# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
        build-essential \
        pkg-config \
        libmariadb-dev && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Run migrations and collect static files
RUN python manage.py migrate
RUN python manage.py collectstatic --noinput

# Start the application
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:8000 Full_Online.wsgi:application"]
