import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding window in-memory rate limiter middleware.
    Limits request rates per client IP address.
    """

    def __init__(self, app, max_requests_per_minute: int = 300):
        super().__init__(app)
        self.max_requests = max_requests_per_minute
        self.window_seconds = 60
        self._requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Allow test client and localhost bypass if desired or rate limit
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean older requests outside the window
        self._requests[client_ip] = [
            req_time for req_time in self._requests[client_ip]
            if now - req_time < self.window_seconds
        ]

        # Check limit
        if len(self._requests[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {self.max_requests} requests per minute exceeded. Please slow down.",
                    "retry_after_seconds": int(self.window_seconds - (now - self._requests[client_ip][0])),
                },
                headers={"Retry-After": str(int(self.window_seconds - (now - self._requests[client_ip][0])))}
            )

        self._requests[client_ip].append(now)
        return await call_next(request)
