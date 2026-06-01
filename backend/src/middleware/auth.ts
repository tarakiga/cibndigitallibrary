import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, getTokenFromHeader, JwtPayload } from '../lib/auth/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware to authenticate requests using JWT
 * @param allowedRoles Optional array of allowed roles
 * @returns Middleware function
 */
export function authenticateToken(allowedRoles?: string[]): RequestHandler {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Check role if allowedRoles is provided
    if (allowedRoles && allowedRoles.length > 0) {
      if (!decoded.role || !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
      }
    }

    // Attach user to request
    req.user = decoded;
    next();
  };
}

/**
 * Middleware to check if the authenticated user is the owner of the resource
 * or has admin role
 * @param resourceOwnerIdParam Name of the parameter containing the resource owner's ID
 * @returns Middleware function
 */
export function isOwnerOrAdmin(resourceOwnerIdParam: string): RequestHandler {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resourceOwnerId = req.params[resourceOwnerIdParam];
    const isAdmin = req.user?.role === 'admin';

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (userId !== resourceOwnerId && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this resource' 
      });
    }

    next();
  };
}

/**
 * Middleware to check if the request is from an admin
 * @returns Middleware function
 */
export function isAdmin(): RequestHandler {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const isAdmin = req.user?.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    next();
  };
}
