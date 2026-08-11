import asyncio
import logging
from datetime import datetime, timedelta, timezone

from app.database.session import SessionLocal
from app.models.user import User
from app.models.company import Company

logger = logging.getLogger(__name__)

def cleanup_unverified_accounts():
    db = SessionLocal()
    try:
        # Accounts older than 2 hours that are not verified
        threshold = datetime.now(timezone.utc) - timedelta(hours=2)
        
        unverified_users = db.query(User).filter(
            User.is_verified == False,
            User.created_at < threshold
        ).all()
        
        if not unverified_users:
            return
            
        logger.info(f"Found {len(unverified_users)} unverified accounts older than 2 hours. Cleaning up...")
        
        for user in unverified_users:
            company_id = user.company_id
            role = user.role
            user_email = user.email
            
            # Hard delete the user
            db.delete(user)
            db.commit()
            logger.info(f"Deleted unverified user {user_email}")
            
            # If they were an owner, also delete the company if it exists
            if role == "owner" and company_id:
                company = db.query(Company).filter(Company.id == company_id).first()
                if company:
                    db.delete(company)
                    db.commit()
                    logger.info(f"Deleted orphaned company {company.name} (ID: {company.id})")
                    
        logger.info("Unverified accounts cleanup complete.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during cleanup of unverified accounts: {e}")
    finally:
        db.close()

async def run_cleanup_task(interval_minutes: int = 15):
    """
    Runs the cleanup task periodically in the background.
    """
    logger.info(f"Starting background cleanup task (runs every {interval_minutes} minutes)...")
    while True:
        try:
            # We run it in a threadpool so it doesn't block the async event loop
            await asyncio.to_thread(cleanup_unverified_accounts)
            
            # Sleep for the interval
            await asyncio.sleep(interval_minutes * 60)
        except asyncio.CancelledError:
            logger.info("Cleanup task cancelled.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in background cleanup task loop: {e}")
            await asyncio.sleep(60) # Sleep briefly before retrying
