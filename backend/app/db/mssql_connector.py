import pyodbc
import re
from typing import Optional, Dict, Any
import logging
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Strict allowlist for the view/table name: an identifier with an optional
# "schema." prefix. Prevents SQL injection via the (operator-controlled) VIEW_NAME.
_VIEW_NAME_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$")


def _validate_view_name(view_name: Optional[str]) -> str:
    """Validate VIEW_NAME against a strict allowlist before interpolation.

    MSSQL object names cannot be parameter-bound, so the only safe approach is
    to reject anything that is not a plain (optionally schema-qualified)
    identifier.
    """
    if not view_name or not _VIEW_NAME_RE.match(view_name):
        raise ValueError("Invalid VIEW_NAME configuration; refusing to build query.")
    return view_name


class MSSQLConnector:
    def get_connection_string(self) -> str:
        """Constructs the connection string from settings."""
        return (
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={settings.CIBN_DB_SERVER};"
            f"DATABASE={settings.CIBN_DB_DATABASE};"
            f"UID={settings.CIBN_DB_USERNAME};"
            f"PWD={settings.CIBN_DB_PASSWORD};"
            f"TrustServerCertificate=yes;"
            f"Encrypt=yes;"
            f"Connect Timeout=10;"
        )

    def authenticate_member(self, member_id: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticates a CIBN member against the external MS SQL database.
        
        Args:
            member_id: The member's ID (EmployeeID).
            password: The member's password.

        Returns:
            A dictionary with member data if authentication is successful, otherwise None.
        """
        conn_str = self.get_connection_string()
        # Validate the configured view name against a strict allowlist before
        # interpolating it into the query (object names cannot be bound).
        view_name = _validate_view_name(settings.VIEW_NAME)
        # Use SELECT * to avoid hardcoding column names that may not exist in the view
        query = f"""
            SELECT *
            FROM {view_name}
            WHERE MemberId = ?
        """

        try:
            with pyodbc.connect(conn_str, timeout=5) as conn:
                cursor = conn.cursor()
                cursor.execute(query, member_id)
                row = cursor.fetchone()

                if row:
                    # Log available columns for debugging (column names only, no PII)
                    columns = [desc[0] for desc in cursor.description]
                    logger.debug(f"MSSQL view columns: {columns}")

                    # Build a dict from whatever columns the view has
                    row_dict = dict(zip(columns, row))
                    logger.debug("MSSQL member row found")

                    # Password comparison (plain text as stored in external DB)
                    db_password = row_dict.get("Password", "")
                    if db_password is not None and str(db_password).strip() == str(password).strip():
                        logger.info("CIBN member authentication succeeded")
                        return {
                            "MemberId": row_dict.get("MemberId", member_id),
                            "Surname": row_dict.get("Surname", ""),
                            "FirstName": row_dict.get("FirstName", ""),
                            "Arrears": row_dict.get("Arrears"),
                            "AnnualSub": row_dict.get("AnnualSub"),
                            "Category": row_dict.get("Category"),
                            "Email": row_dict.get("Email", row_dict.get("EmailAddress", "")),
                        }
                    else:
                        logger.warning("CIBN member authentication failed: password mismatch")
                else:
                    logger.warning("CIBN member authentication failed: no matching member record")
        except pyodbc.Error as ex:
            sqlstate = ex.args[0]
            logger.error(f"MSSQL DB Connection/Query Error (SQLSTATE: {sqlstate}): {ex}")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred in MSSQL connector: {e}")
            return None

        logger.warning("CIBN member authentication failed")
        return None

# Singleton instance of the connector
mssql_db = MSSQLConnector()