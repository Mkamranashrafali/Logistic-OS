import multiprocessing

# Bind to localhost on port 8000 (Nginx will reverse proxy to this)
bind = "127.0.0.1:8000"

# Use Uvicorn's worker class for ASGI apps (FastAPI)
worker_class = "uvicorn.workers.UvicornWorker"

# Calculate optimal worker count based on CPU cores
# A standard formula for I/O bound ASGI apps is (2 x $num_cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1

# Timeouts
timeout = 120
keepalive = 5

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Forwarded IPs (from Nginx)
forwarded_allow_ips = "127.0.0.1"
