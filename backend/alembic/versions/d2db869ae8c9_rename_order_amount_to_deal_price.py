"""rename order amount to deal_price

Revision ID: d2db869ae8c9
Revises: b5722db512bc
Create Date: 2026-07-16 14:47:49.922683

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2db869ae8c9'
down_revision: Union[str, Sequence[str], None] = 'b5722db512bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('orders', 'amount', new_column_name='deal_price')

def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('orders', 'deal_price', new_column_name='amount')
