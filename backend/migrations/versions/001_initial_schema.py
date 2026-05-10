"""Initial migration - Create all tables

Revision ID: 001
Revises:
Create Date: 2026-05-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create admins table
    op.create_table(
        'admins',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admins_id'), 'admins', ['id'], unique=False)

    # Create persons table
    op.create_table(
        'persons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('access_status', sa.String(), nullable=False, server_default='AUTHORIZED'),
        sa.Column('image_folder', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_persons_id'), 'persons', ['id'], unique=False)

    # Create cameras table
    op.create_table(
        'cameras',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('camera_code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('camera_code')
    )
    op.create_index(op.f('ix_cameras_id'), 'cameras', ['id'], unique=False)

    # Create embeddings table
    op.create_table(
        'embeddings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('person_id', sa.Integer(), nullable=True),
        sa.Column('embedding_data', sa.LargeBinary(), nullable=True),
        sa.Column('model_name', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['person_id'], ['persons.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_embeddings_id'), 'embeddings', ['id'], unique=False)
    op.create_index(op.f('ix_embeddings_person_id'), 'embeddings', ['person_id'], unique=False)

    # Create events table
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_code', sa.String(), nullable=False),
        sa.Column('camera_id', sa.Integer(), nullable=True),
        sa.Column('person_id', sa.Integer(), nullable=True),
        sa.Column('person_name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('original_image_path', sa.String(), nullable=True),
        sa.Column('watermarked_image_path', sa.String(), nullable=True),
        sa.Column('visible_watermark_text', sa.Text(), nullable=True),
        sa.Column('invisible_watermark_payload', sa.Text(), nullable=True),
        sa.Column('image_hash', sa.String(), nullable=True),
        sa.Column('verification_status', sa.String(), nullable=False, server_default='NOT_VERIFIED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['camera_id'], ['cameras.id']),
        sa.ForeignKeyConstraint(['person_id'], ['persons.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_code')
    )
    op.create_index(op.f('ix_events_id'), 'events', ['id'], unique=False)
    op.create_index(op.f('ix_events_camera_id'), 'events', ['camera_id'], unique=False)
    op.create_index(op.f('ix_events_person_id'), 'events', ['person_id'], unique=False)
    op.create_index(op.f('ix_events_created_at'), 'events', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_events_created_at'), table_name='events')
    op.drop_index(op.f('ix_events_person_id'), table_name='events')
    op.drop_index(op.f('ix_events_camera_id'), table_name='events')
    op.drop_index(op.f('ix_events_id'), table_name='events')
    op.drop_table('events')

    op.drop_index(op.f('ix_embeddings_person_id'), table_name='embeddings')
    op.drop_index(op.f('ix_embeddings_id'), table_name='embeddings')
    op.drop_table('embeddings')

    op.drop_index(op.f('ix_cameras_id'), table_name='cameras')
    op.drop_table('cameras')

    op.drop_index(op.f('ix_persons_id'), table_name='persons')
    op.drop_table('persons')

    op.drop_index(op.f('ix_admins_id'), table_name='admins')
    op.drop_table('admins')
