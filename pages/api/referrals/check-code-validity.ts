// pages/api/referrals/check-code-validity.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import dbConnect from '../../../lib/dbConnect';
import Referral from '../../../lib/models/referral';

type ErrorResponse = {
  success: false;
  error: string;
};

type SuccessResponse = {
  success: true;
  discount: number;
  code: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { code } = req.body;
    console.log(code);

    if (!code) {
      return res.status(400).json({ success: false, error: 'Referral code is required' });
    }

    const session = await getSession(req, res);
    const userId = session?.user?.email;

    console.log(userId)

    const referral = await Referral.findOne({ 
      code: code.toString().trim().toUpperCase() 
    });

    if (!referral) {
      return res.status(404).json({ success: false, error: 'Invalid referral code' });
    }

    const now = new Date();
    if (now > referral.expiryDate) {
      return res.status(400).json({ success: false, error: 'This referral code has expired' });
    }

    if (!referral.active) {
      return res.status(400).json({ success: false, error: 'This referral code is no longer active' });
    }

    if (referral.maxUses !== null && referral.usedBy.length >= referral.maxUses) {
      return res.status(400).json({ success: false, error: 'This referral code has reached its maximum usage limit' });
    }

    if (userId && referral.usedBy.includes(userId)) {
      return res.status(400).json({ success: false, error: 'You have already used this referral code' });
    }

    return res.status(200).json({
      success: true,
      discount: referral.discount,
      code: referral.code,
      message: `Referral code applied! You'll receive a ${referral.discount}% discount.`
    });
  } catch (error) {
    console.error('Error checking referral code:', error);
    return res.status(500).json({ success: false, error: 'Server error while validating referral code' });
  }
}