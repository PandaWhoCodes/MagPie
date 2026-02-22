"""
Database Schema Manager
Automatically syncs database schema with defined models
"""

import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass


@dataclass
class Column:
    name: str
    type: str
    nullable: bool = True
    default: Optional[str] = None
    primary_key: bool = False
    foreign_key: Optional[str] = None
    unique: bool = False


@dataclass
class Index:
    name: str
    table: str
    columns: List[str]
    unique: bool = False


@dataclass
class Table:
    name: str
    columns: List[Column]
    indexes: List[Index] = None

    def __post_init__(self):
        if self.indexes is None:
            self.indexes = []


class SchemaManager:
    """Manages database schema migrations and syncing"""

    def __init__(self, conn):
        self.conn = conn
        self.schema_definitions = self._define_schema()

    def _define_schema(self) -> Dict[str, Table]:
        """Define the expected database schema"""
        return {
            'events': Table(
                name='events',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('name', 'TEXT', nullable=False),
                    Column('description', 'TEXT', nullable=True),
                    Column('date', 'TEXT', nullable=False),
                    Column('time', 'TEXT', nullable=False),
                    Column('venue', 'TEXT', nullable=False),
                    Column('venue_address', 'TEXT', nullable=True),
                    Column('venue_map_link', 'TEXT', nullable=True),
                    Column('is_active', 'INTEGER', nullable=True, default='0'),
                    Column('registrations_open', 'INTEGER', nullable=True, default='1'),
                    Column('created_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                    Column('updated_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ],
                indexes=[
                    Index('idx_events_active', 'events', ['is_active'])
                ]
            ),

            'event_fields': Table(
                name='event_fields',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('event_id', 'TEXT', nullable=False, foreign_key='events(id) ON DELETE CASCADE'),
                    Column('field_name', 'TEXT', nullable=False),
                    Column('field_type', 'TEXT', nullable=False),
                    Column('field_label', 'TEXT', nullable=False),
                    Column('is_required', 'INTEGER', nullable=True, default='0'),
                    Column('field_options', 'TEXT', nullable=True),
                    Column('field_order', 'INTEGER', nullable=True, default='0'),
                ]
            ),

            'registrations': Table(
                name='registrations',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('event_id', 'TEXT', nullable=False, foreign_key='events(id) ON DELETE CASCADE'),
                    Column('email', 'TEXT', nullable=False),
                    Column('phone', 'TEXT', nullable=False),
                    Column('form_data', 'TEXT', nullable=False),
                    Column('is_checked_in', 'INTEGER', nullable=True, default='0'),
                    Column('checked_in_at', 'TEXT', nullable=True),
                    Column('created_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ],
                indexes=[
                    Index('idx_registrations_event', 'registrations', ['event_id']),
                    Index('idx_registrations_email', 'registrations', ['email'])
                ]
            ),

            'user_profiles': Table(
                name='user_profiles',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('email', 'TEXT', nullable=False, unique=True),
                    Column('phone', 'TEXT', nullable=True),
                    Column('profile_data', 'TEXT', nullable=False),
                    Column('last_updated', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ],
                indexes=[
                    Index('idx_user_profiles_email', 'user_profiles', ['email'])
                ]
            ),

            'qr_codes': Table(
                name='qr_codes',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('event_id', 'TEXT', nullable=False, foreign_key='events(id) ON DELETE CASCADE'),
                    Column('message', 'TEXT', nullable=False),
                    Column('qr_type', 'TEXT', nullable=True, default="'message'"),
                    Column('created_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ]
            ),

            'branding_settings': Table(
                name='branding_settings',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('site_title', 'TEXT', nullable=True, default="'MagPie'"),
                    Column('site_headline', 'TEXT', nullable=True, default="'Where Innovation Meets Community'"),
                    Column('logo_url', 'TEXT', nullable=True),
                    Column('text_style', 'TEXT', nullable=True, default="'gradient'"),
                    Column('theme', 'TEXT', nullable=True, default="'default'"),
                    Column('updated_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ]
            ),

            'message_templates': Table(
                name='message_templates',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('template_name', 'TEXT', nullable=False),
                    Column('template_text', 'TEXT', nullable=False),
                    Column('created_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                    Column('updated_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ],
                indexes=[
                    Index('idx_message_templates_name', 'message_templates', ['template_name'])
                ]
            ),

            'test_migration': Table(
                name='test_migration',
                columns=[
                    Column('id', 'TEXT', nullable=False, primary_key=True),
                    Column('test_field', 'TEXT', nullable=False),
                    Column('test_number', 'INTEGER', nullable=True, default='0'),
                    Column('new_test_column', 'TEXT', nullable=True, default="'default_value'"),
                    Column('created_at', 'TEXT', nullable=True, default='CURRENT_TIMESTAMP'),
                ],
                indexes=[
                    Index('idx_test_migration_field', 'test_migration', ['test_field'])
                ]
            ),
        }

    def get_existing_tables(self) -> Dict[str, List[Dict]]:
        """Get all existing tables and their columns from the database"""
        cursor = self.conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        tables = {}
        for row in cursor.fetchall():
            table_name = row[0]
            col_cursor = self.conn.execute(f"PRAGMA table_info({table_name})")
            columns = []
            for col_row in col_cursor.fetchall():
                columns.append({
                    'cid': col_row[0],
                    'name': col_row[1],
                    'type': col_row[2],
                    'notnull': col_row[3],
                    'default': col_row[4],
                    'pk': col_row[5]
                })
            tables[table_name] = columns
        return tables

    def get_existing_indexes(self) -> List[Dict]:
        """Get all existing indexes from the database"""
        cursor = self.conn.execute(
            "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'"
        )
        indexes = []
        for row in cursor.fetchall():
            indexes.append({
                'name': row[0],
                'table': row[1],
                'sql': row[2]
            })
        return indexes

    def create_table(self, table: Table):
        """Create a new table"""
        print(f"  📋 Creating table: {table.name}")

        columns_sql = []
        for col in table.columns:
            col_def = f"{col.name} {col.type}"
            if col.primary_key:
                col_def += " PRIMARY KEY"
            if not col.nullable:
                col_def += " NOT NULL"
            if col.unique:
                col_def += " UNIQUE"
            if col.default is not None:
                col_def += f" DEFAULT {col.default}"
            columns_sql.append(col_def)

        # Add foreign key constraints
        for col in table.columns:
            if col.foreign_key:
                columns_sql.append(f"FOREIGN KEY ({col.name}) REFERENCES {col.foreign_key}")

        sql = f"CREATE TABLE IF NOT EXISTS {table.name} ({', '.join(columns_sql)})"
        self.conn.execute(sql)
        print(f"    ✅ Created table: {table.name}")

    def add_column(self, table_name: str, column: Column):
        """Add a column to an existing table"""
        print(f"  ➕ Adding column: {table_name}.{column.name}")

        col_def = f"{column.type}"
        if column.default is not None:
            col_def += f" DEFAULT {column.default}"

        try:
            sql = f"ALTER TABLE {table_name} ADD COLUMN {column.name} {col_def}"
            self.conn.execute(sql)

            # If not nullable and no default, update with a sensible default
            if not column.nullable and column.default is None:
                if column.type == 'TEXT':
                    self.conn.execute(f"UPDATE {table_name} SET {column.name} = '' WHERE {column.name} IS NULL")
                elif column.type == 'INTEGER':
                    self.conn.execute(f"UPDATE {table_name} SET {column.name} = 0 WHERE {column.name} IS NULL")

            print(f"    ✅ Added column: {column.name}")
        except Exception as e:
            error_msg = str(e).lower()
            if "duplicate column name" in error_msg:
                print(f"    ℹ️  Column {column.name} already exists")
            elif "wal frame insert conflict" in error_msg:
                print(f"    ⚠️  WAL conflict detected, retrying column addition...")
                # Retry after a brief moment
                import time
                time.sleep(0.1)
                try:
                    self.conn.execute(sql)
                    print(f"    ✅ Added column: {column.name} (retry successful)")
                except:
                    print(f"    ⚠️  Could not add column due to WAL conflict, it may already exist")
            else:
                raise

    def create_index(self, index: Index):
        """Create an index"""
        print(f"  📍 Creating index: {index.name}")

        unique = "UNIQUE " if index.unique else ""
        columns = ", ".join(index.columns)
        sql = f"CREATE {unique}INDEX IF NOT EXISTS {index.name} ON {index.table} ({columns})"

        try:
            self.conn.execute(sql)
            print(f"    ✅ Created index: {index.name}")
        except Exception as e:
            print(f"    ℹ️  Index {index.name} might already exist")

    def drop_table(self, table_name: str):
        """Drop a table that's no longer in the schema"""
        print(f"  🗑️  Dropping obsolete table: {table_name}")
        try:
            self.conn.execute(f"DROP TABLE IF EXISTS {table_name}")
            print(f"    ✅ Dropped table: {table_name}")
        except Exception as e:
            print(f"    ⚠️  Could not drop table: {e}")

    def sync_schema(self):
        """Sync the database schema with the defined schema"""
        print("\n🔄 Syncing database schema...")

        existing_tables = self.get_existing_tables()
        existing_indexes = {idx['name'] for idx in self.get_existing_indexes()}

        # Track what we've processed
        processed_tables = set()

        # Create or update tables
        for table_name, table in self.schema_definitions.items():
            processed_tables.add(table_name)

            if table_name not in existing_tables:
                # Create new table
                self.create_table(table)
            else:
                # Check for missing columns
                existing_columns = {col['name']: col for col in existing_tables[table_name]}

                for column in table.columns:
                    if column.name not in existing_columns:
                        self.add_column(table_name, column)
                    else:
                        # Check if column properties match (optional: for strict mode)
                        existing = existing_columns[column.name]
                        if existing['type'] != column.type:
                            print(f"    ⚠️  Column type mismatch for {table_name}.{column.name}: "
                                  f"expected {column.type}, found {existing['type']}")

            # Create indexes
            if table.indexes:
                for index in table.indexes:
                    if index.name not in existing_indexes:
                        self.create_index(index)

        # Drop tables that are not in schema (optional - disabled by default for safety)
        # for table_name in existing_tables:
        #     if table_name not in processed_tables:
        #         self.drop_table(table_name)

        # Insert default data if needed
        self._insert_default_data()

        # Commit all changes
        self.conn.commit()

        print("✅ Database schema sync completed!\n")

    def _insert_default_data(self):
        """Insert default data for tables that need it"""
        # Check if branding_settings has default record
        cursor = self.conn.execute("SELECT COUNT(*) FROM branding_settings WHERE id = 'default'")
        if cursor.fetchone()[0] == 0:
            print("  📝 Inserting default branding settings...")
            self.conn.execute("""
                INSERT INTO branding_settings (id, site_title, site_headline, text_style)
                VALUES ('default', 'MagPie', 'Where Events Take Flight', 'gradient')
            """)
            print("    ✅ Default branding settings inserted")
