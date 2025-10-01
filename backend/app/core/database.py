import libsql
from app.core.config import get_settings

settings = get_settings()


class Database:
    """Database connection manager for Turso"""

    def __init__(self):
        self.conn = None

    async def connect(self):
        """Connect to Turso database"""
        # Connect using embedded replica for better performance
        self.conn = libsql.connect(
            "local.db",
            sync_url=settings.TURSO_DATABASE_URL,
            auth_token=settings.TURSO_AUTH_TOKEN
        )
        # Sync with remote database
        self.conn.sync()
        await self.init_tables()

    async def init_tables(self):
        """Initialize database tables"""

        # Events table
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                venue TEXT NOT NULL,
                venue_address TEXT,
                venue_map_link TEXT,
                is_active INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Event fields table (dynamic fields for each event)
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS event_fields (
                id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                field_name TEXT NOT NULL,
                field_type TEXT NOT NULL,
                field_label TEXT NOT NULL,
                is_required INTEGER DEFAULT 0,
                field_options TEXT,
                field_order INTEGER DEFAULT 0,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """
        )

        # Registrations table
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS registrations (
                id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                form_data TEXT NOT NULL,
                is_checked_in INTEGER DEFAULT 0,
                checked_in_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """
        )

        # User profiles table (for auto-fill)
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                profile_data TEXT NOT NULL,
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # QR codes table
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS qr_codes (
                id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                message TEXT NOT NULL,
                qr_type TEXT DEFAULT 'message',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """
        )

        # Branding settings table
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS branding_settings (
                id TEXT PRIMARY KEY,
                site_title TEXT DEFAULT 'Build2Learn',
                site_headline TEXT DEFAULT 'Where Innovation Meets Community',
                logo_url TEXT,
                text_style TEXT DEFAULT 'gradient',
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Insert default branding if not exists
        default_branding = self.conn.execute(
            "SELECT COUNT(*) as count FROM branding_settings"
        ).fetchone()

        if default_branding[0] == 0:
            self.conn.execute(
                """
                INSERT INTO branding_settings (id, site_title, site_headline, text_style)
                VALUES ('default', 'Build2Learn', 'Where Innovation Meets Community', 'gradient')
                """
            )

        # Create indexes for better performance
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active)"
        )
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id)"
        )
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email)"
        )
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email)"
        )

        # Commit changes
        self.conn.commit()
        # Sync with remote
        self.conn.sync()

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
