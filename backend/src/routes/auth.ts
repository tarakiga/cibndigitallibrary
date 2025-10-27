import { Router } from 'express';
import { cibnMemberModel } from '../models/CIBNMember';
import { generateToken } from '../lib/auth/jwt';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface LoginRequest {
  memberId: string;
  password: string;
}

/**
 * @route POST /api/auth/cibn/login
 * @desc Authenticate a CIBN member
 * @access Public
 */
router.post('/cibn/login', async (req, res) => {
  try {
    const { memberId, password } = req.body as LoginRequest;

    // Validate input
    if (!memberId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Member ID and password are required' 
      });
    }

    // Authenticate member
    const member = await cibnMemberModel.authenticate(memberId, password);
    
    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: member.MemberId,
      email: member.Email || '',
      role: 'cibn_member',
      name: `${member.FirstName} ${member.Surname}`.trim()
    });

    // Return token and user data (excluding sensitive information)
    const { Password, ...memberData } = member as any;
    
    res.json({
      success: true,
      token,
      user: memberData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during authentication' 
    });
  }
});

/**
 * @route GET /api/auth/cibn/me
 * @desc Get current authenticated CIBN member's profile
 * @access Private (CIBN members only)
 */
router.get('/cibn/me', authenticateToken('cibn_member'), async (req, res) => {
  try {
    const memberId = (req as any).user.id;
    const member = await cibnMemberModel.getById(memberId);
    
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'Member not found' 
      });
    }

    // Exclude sensitive information
    const { Password, ...memberData } = member as any;
    
    res.json({
      success: true,
      user: memberData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve member profile' 
    });
  }
});

export default router;
