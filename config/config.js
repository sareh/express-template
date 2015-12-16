module.exports = {
  'secret': 'supersecretloginwithjwts',
  'database': process.env.MONGOLAB_URI || 'mongodb://localhost:27017/expresstemplate'
};