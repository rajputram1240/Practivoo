import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/utils/db';
import School from '@/models/School';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const schools = await School.find({});
        return res.status(200).json({ success: true, data: schools });
      }

      case 'POST': {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
          return res
            .status(400)
            .json({ success: false, message: 'Name, email, and password are required' });
        }

        const existing = await School.findOne({ email });
        if (existing) {
          return res
            .status(409)
            .json({ success: false, message: 'School with this email already exists' });
        }

        const school = await School.create({ name, email, password, phone, address });
        return res.status(201).json({ success: true, data: school });
      }

      case 'PUT': {
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID is required' });
        }

        // Do not allow password change through this endpoint
        if ('password' in updateData) delete updateData.password;

        const updatedSchool = await School.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updatedSchool) {
          return res.status(404).json({ success: false, message: 'School not found' });
        }

        return res.status(200).json({ success: true, data: updatedSchool });
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID is required' });
        }

        const deleted = await School.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, message: 'School not found' });
        }

        return res.status(200).json({ success: true, message: 'School deleted' });
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}