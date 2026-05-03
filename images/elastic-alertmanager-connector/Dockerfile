FROM python:3.9-slim

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY --chown=appuser:appuser . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080
ENV PYTHONUNBUFFERED=1

USER appuser

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
