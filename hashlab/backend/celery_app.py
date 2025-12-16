from celery import Celery

def make_celery():
    # Import inside to avoid circular import
    from backend.app import create_app  
    flask_app = create_app()

    celery = Celery(
        "hashlab",
        broker="redis://localhost:6379/0",
        backend="redis://localhost:6379/0",
        include=[
            "backend.app.tasks.crack_job"
        ]
    )

    celery.conf.update(flask_app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with flask_app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery()

# FORCE Celery to load all tasks under backend/app/tasks
celery.autodiscover_tasks(packages=["backend.app.tasks"])
