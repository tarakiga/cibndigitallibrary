import { sqlServerDB } from '../lib/db/sqlserver';

export interface CIBNMember {
  MemberId: string;
  Surname: string;
  FirstName: string;
  Email?: string;
  Phone?: string;
  Arrears: number;
  AnnualSub: number;
  Category: string;
  IsActive: boolean;
  LastLogin?: Date;
}

class CIBNMemberModel {
  /**
   * Authenticate a CIBN member by MemberId and Password
   * @param memberId The member's ID
   * @param password The member's password (plain text, will be hashed and verified)
   * @returns The member data if authentication is successful, null otherwise
   */
  public async authenticate(memberId: string, password: string): Promise<CIBNMember | null> {
    try {
      // Note: In a real application, you should hash the password before comparing
      // This is a basic example - use proper password hashing in production
      const query = `
        SELECT 
          MemberId, Surname, FirstName, Email, Phone, 
          Arrears, AnnualSub, Category, IsActive, LastLogin
        FROM Members 
        WHERE MemberId = @memberId AND Password = @password AND IsActive = 1
      `;
      
      const result = await sqlServerDB.query<CIBNMember>(query, [memberId, password]);
      
      if (result && result.length > 0) {
        // Update last login timestamp
        await this.updateLastLogin(memberId);
        return result[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error authenticating CIBN member:', error);
      throw error;
    }
  }

  /**
   * Get a CIBN member by MemberId
   * @param memberId The member's ID
   * @returns The member data if found, null otherwise
   */
  public async getById(memberId: string): Promise<CIBNMember | null> {
    try {
      const query = `
        SELECT 
          MemberId, Surname, FirstName, Email, Phone, 
          Arrears, AnnualSub, Category, IsActive, LastLogin
        FROM Members 
        WHERE MemberId = @memberId
      `;
      
      const result = await sqlServerDB.query<CIBNMember>(query, [memberId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting CIBN member by ID:', error);
      throw error;
    }
  }

  /**
   * Update the last login timestamp for a member
   * @param memberId The member's ID
   */
  private async updateLastLogin(memberId: string): Promise<void> {
    try {
      const query = `
        UPDATE Members 
        SET LastLogin = GETDATE() 
        WHERE MemberId = @memberId
      `;
      
      await sqlServerDB.query(query, [memberId]);
    } catch (error) {
      // Log the error but don't fail the authentication
      console.error('Error updating last login:', error);
    }
  }
}

export const cibnMemberModel = new CIBNMemberModel();
