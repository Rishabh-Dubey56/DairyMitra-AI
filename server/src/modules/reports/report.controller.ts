import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service.js';
import { HttpStatus } from '../../shared/constants/httpStatus.js';

export class ReportController {
  public async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await reportService.getDashboardStats();
      // Match frontend expectations directly for seamless plug-and-play
      res.status(HttpStatus.OK).json(stats);
    } catch (err) {
      next(err);
    }
  }

  // Stream CSV directly to client response
  public async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = (req.query.type as 'milk' | 'finance') || 'milk';
      const filename = `dairymitra_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Transfer-Encoding', 'chunked');

      const stream = reportService.createCsvStream(type);
      stream.pipe(res);

      stream.on('error', (err) => {
        next(err);
      });
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
