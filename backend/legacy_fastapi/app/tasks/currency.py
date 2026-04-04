from worker.celery_app import celery_app

@celery_app.task(name="app.tasks.currency.fetch_daily_exchange_rates")
def fetch_daily_exchange_rates():
    """
    Simulates fetching daily rates from exchangerate-api.com
    and storing them in the Redis Cache.
    """
    rates = {
        "EUR": 0.92,
        "GBP": 0.79,
        "JPY": 150.2
    }
    # In a real app, you would use redis client to set these values.
    return rates
