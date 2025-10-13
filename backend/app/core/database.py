import libsql
from app.core.config import get_settings
from app.core.schema_manager import SchemaManager

settings = get_settings()


class Database:
    """Database connection manager for Turso"""

    def __init__(self):
        self.conn = None
        self.schema_manager = None

    async def connect(self):
        """Connect to database"""
        if settings.IS_LOCAL:
            # Local development: Use local SQLite if the flag is enabled
            self.conn = libsql.connect("../local-dev/magpie_local.db")
            print("✅ Connected to local SQLite database")
        else:
            # Production: Use Turso with embedded replica
            self.conn = libsql.connect(
                "local.db",
                sync_url=settings.TURSO_DATABASE_URL,
                auth_token=settings.TURSO_AUTH_TOKEN
            )
            print("✅ Connected to Turso database")

        # Initialize schema manager and sync schema
        self.schema_manager = SchemaManager(self.conn)
        self.schema_manager.sync_schema()

        # Only sync with remote if using Turso
        if not settings.IS_LOCAL:
            try:
                self.conn.sync()
            except Exception as e:
                print(f"⚠️  Warning: Could not sync with remote database: {e}")

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
        self.conn.commit()

        # Only sync with remote if using Turso
        if not settings.IS_LOCAL:
            self.conn.sync()

        return result

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