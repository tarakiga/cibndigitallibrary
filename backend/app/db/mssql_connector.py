import pyodbc
from typing import Optional, Dict, Any
import logging
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MSSQLConnector:
    def get_connection_string(self) -> str:
        """Constructs the connection string from settings."""
        return (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={settings.CIBN_DB_SERVER};"
            f"DATABASE={settings.CIBN_DB_DATABASE};"
            f"UID={settings.CIBN_DB_USERNAME};"
            f"PWD={settings.CIBN_DB_PASSWORD};"
            f"Connect Timeout=10;"  # Add a 10-second connection timeout
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
        query = """
            SELECT MemberId, Password, Surname, FirstName, Arrears, AnnualSub, Category, Email
            FROM Members
            WHERE MemberId = ?
        """

        try:
            with pyodbc.connect(conn_str, timeout=5) as conn:
                cursor = conn.cursor()
                cursor.execute(query, member_id)
                row = cursor.fetchone()

                if row:
                    # IMPORTANT: This is a plain text password comparison as requested.
                    # This is a significant security risk. It is highly recommended to
                    # use a hashed password storage mechanism in the external database.
                    if row.Password == password:
                        logger.info(f"Successfully authenticated CIBN member: {member_id}")
                        # Return data as a dictionary
                        return {
                            "MemberId": row.MemberId,
                            "Surname": row.Surname,
                            "FirstName": row.FirstName,
                            "Arrears": row.Arrears,
                            "AnnualSub": row.AnnualSub,
                            "Category": row.Category,
                            "Email": row.Email
                        }
        except pyodbc.Error as ex:
            sqlstate = ex.args[0]
            logger.error(f"MSSQL DB Connection/Query Error (SQLSTATE: {sqlstate}): {ex}")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred in MSSQL connector: {e}")
            return None

        logger.warning(f"CIBN member authentication failed for member ID: {member_id}")
        return None

# Singleton instance of the connector
mssql_db = MSSQLConnector()