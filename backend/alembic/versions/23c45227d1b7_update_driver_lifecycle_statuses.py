"""update_driver_lifecycle_statuses

Revision ID: 23c45227d1b7
Revises: a745110a6022
Create Date: 2026-07-22 10:41:28.777188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '23c45227d1b7'
down_revision: Union[str, Sequence[str], None] = 'a745110a6022'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("UPDATE drivers SET lifecycle_status = 'inactive' WHERE lifecycle_status = 'suspended'")
    op.execute("UPDATE drivers SET lifecycle_status = 'archived' WHERE lifecycle_status = 'terminated'")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("UPDATE drivers SET lifecycle_status = 'suspended' WHERE lifecycle_status = 'inactive'")
    op.execute("UPDATE drivers SET lifecycle_status = 'terminated' WHERE lifecycle_status = 'archived'")
