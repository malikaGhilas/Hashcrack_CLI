from backend.celery_app import celery
from backend.app.extensions import db
from backend.app.models import Job
from backend.app.services.cracking import (
    DictionaryStrategy,
    BruteForceStrategy,
    HybridStrategy,
)


@celery.task(name="crack_job")
def crack_job(job_id):
    job = Job.query.get(job_id)

    if not job:
        return {"error": f"Job {job_id} not found"}

    job.status = "RUNNING"
    db.session.commit()

    try:
        options = job.options or {}

        if job.strategy == "dictionary":
            wordlist = options.get("wordlist", "dico.txt")
            strat = DictionaryStrategy(wordlist)

        elif job.strategy == "bruteforce":
            strat = BruteForceStrategy(
                charset=options.get("charset"),
                min_length=options.get("min_length", 1),
                max_length=options.get("max_length", 4),
                max_combinations=options.get("max_combinations", 5_000_000),
            )

        elif job.strategy == "hybrid":
            wordlist = options.get("wordlist", "dico.txt")
            strat = HybridStrategy(wordlist)

        else:
            raise ValueError(f"Unknown strategy: {job.strategy}")

        result = strat.crack(job.target_hash, job.algo)

        job.status = "DONE"
        job.plaintext = result.get("plaintext")
        job.duration = result.get("duration")
        job.tried = result.get("tried")

        db.session.commit()
        return result

    except Exception as e:
        job.status = "ERROR"
        db.session.commit()
        return {"error": str(e)}
