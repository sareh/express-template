var Privatechat   = require('../models/privatechat');

function chatsIndex(req, res) {
  Privatechat.find(function(err, privatechats){
    if (err) return res.status(404).json({ message: 'Sorry, something went wrong.' });
    res.status(200).json({ privatechats: privatechats });
  });
}

function privatechatsShow(req, res) {
  Privatechat.findById(req.params.id, function(){
    if (err) return res.status(404).json({ message: 'Sorry, something went wrong.' });
    res.status(200).json({ privatechat: privatechat });
  });
}

function privatechatsCreate(req, res){
  var privatechat = new Privatechat(req.body.privatechat);
  privatechat.save(function(err){
    if (err) return res.status(500).send(err);

    // Pushes in privatechat to the User's model in the user.privatechats array
    var id = req.body.privatechat.user_id;
    User.findById(id, function(err, user){
       user.privatechats.push(privatechat);
       user.save();
       return res.status(201).send(privatechat)
    });
  });
}

module.exports = {
  privatechatsIndex:  privatechatsIndex,
  privatechatsShow:   privatechatsShow,
  privatechatsCreate: privatechatsCreate
}