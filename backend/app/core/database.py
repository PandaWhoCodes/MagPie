import libsql
from contextlib import contextmanager
from app.core.config import get_settings
from app.core.schema_manager import SchemaManager

settings = get_settings()


class Database:
    """Database connection manager for Turso"""

    def __init__(self):
        self.conn = None
        self.schema_manager = None
        self._in_transaction = False

    async def connect(self):
        """Connect to database"""
        if settings.IS_LOCAL:
            # Local development: Use local SQLite if the flag is enabled
            self.conn = libsql.connect("../local-dev/magpie_local.db")
            print("✅ Connected to local SQLite database")
        else:
            # Production: Direct connection to Turso (no embedded replica)
            # Convert libsql:// to https:// for direct connection
            db_url = settings.TURSO_DATABASE_URL.replace("libsql://", "https://")
            self.conn = libsql.connect(
                db_url,
                auth_token=settings.TURSO_AUTH_TOKEN
            )
            print("✅ Connected to Turso database (direct connection)")

        # Initialize schema manager and sync schema
        self.schema_manager = SchemaManager(self.conn)
        self.schema_manager.sync_schema()

    async def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

    async def execute(self, query: str, params: list = None):
        """Execute a query"""
        if params:
            result = self.conn.execute(query, params)
        else:
            result = self.conn.execute(query)
        # Only auto-commit if not in a transaction
        if not self._in_transaction:
            self.conn.commit()
        return result

    @contextmanager
    def transaction(self):
        """Context manager for database transactions.

        Usage:
            with db.transaction():
                await db.execute("DELETE ...")
                await db.execute("INSERT ...")

        All operations within the block are committed together,
        or rolled back if an exception occurs.
        """
        self._in_transaction = True
        try:
            yield
            self.conn.commit()
        except Exception:
            self.conn.rollback()
            raise
        finally:
            self._in_transaction = False

    async def fetch_all(self, query: str, params: list = None):
        """Fetch all rows"""
        if params:
            cursor = self.conn.execute(query, params)
        else:
            cursor = self.conn.execute(query)

        # Get column names
        columns = [desc[0] for desc in cursor.description] if cursor.description else []

        # Fetch all rows and convert to dicts
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows] if rows else []

    async def fetch_one(self, query: str, params: list = None):
        """Fetch one row"""
        if params:
            cursor = self.conn.execute(query, params)
        else:
            cursor = self.conn.execute(query)

        # Get column names
        columns = [desc[0] for desc in cursor.description] if cursor.description else []

        # Fetch one row and convert to dict
        row = cursor.fetchone()
        return dict(zip(columns, row)) if row else None


# Global database instance
db = Database()