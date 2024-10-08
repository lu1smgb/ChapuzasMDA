FROM python:3.11

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE ${DJANGO_PORT}

CMD [ "python", "manage.py", "runserver", "${DJANGO_HOST}:${DJANGO_PORT}" ]