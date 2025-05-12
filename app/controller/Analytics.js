const logger = require('../libs/logger');
const AnalyticsMod = require('../model/AnalyticsMod');

const analyticsMod = new AnalyticsMod();

class Analytics {
  async getHistoricalData(req, res) {
    const options = req.query;
    try {
      const r = await analyticsMod.getHistoricalData(options);
      res.send({
        success: true,
        data: r
      });
    } catch (e) {
      logger.error(e);
      res.send({
        success: false,
        message: e.message
      });
    }
  }

  async getSummary(req, res) {
    const options = req.query;
    try {
      const r = await analyticsMod.getSummary(options);
      res.send({
        success: true,
        data: r
      });
    } catch (e) {
      logger.error(e);
      res.send({
        success: false,
        message: e.message
      });
    }
  }

  async getClients(req, res) {
    try {
      const r = await analyticsMod.getClients();
      res.send({
        success: true,
        data: r
      });
    } catch (e) {
      logger.error(e);
      res.send({
        success: false,
        message: e.message
      });
    }
  }
}

module.exports = Analytics;
