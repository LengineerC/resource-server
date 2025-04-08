import log4js from 'log4js';
import process from 'process';
import path from 'path';

log4js.configure({
  appenders:{
    file:{
      type:"file",
      filename:path.join(process.cwd(),"log","app.log"),
      maxLogSize:5242880,
      backups:3,
      compress:true,
      daysToKeep:7,
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: { appenders: ['file', 'console'], level: 'info' }
  }
});

const logger=log4js.getLogger();

export default logger;